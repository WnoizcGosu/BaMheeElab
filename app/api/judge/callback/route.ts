/**
 * Judge0 webhook target.
 *
 * Judge0 POSTs here when a submission finishes (configured via callback_url
 * on each /submissions request). The body matches Judge0's standard result
 * shape. The worker also polls Judge0 directly — this endpoint exists so we
 * can move to a fully push-driven flow without a code change on Judge0's side.
 *
 * Auth: header `X-Callback-Secret` (preferred) or `?secret=` query (fallback
 * for Judge0 builds that don't forward custom headers). 401 on mismatch.
 */
import { NextResponse, type NextRequest } from "next/server";
import { JUDGE0_CALLBACK_SECRET } from "@/lib/judge0";

interface Judge0CallbackBody {
  token: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message?: string | null;
  time: string | null;
  memory: number | null;
}

export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get("x-callback-secret");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const provided = headerSecret || querySecret;

  if (provided !== JUDGE0_CALLBACK_SECRET) {
    return NextResponse.json({ error: "Bad secret" }, { status: 401 });
  }

  let body: Judge0CallbackBody;
  try {
    body = (await req.json()) as Judge0CallbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.token || !body?.status?.id) {
    return NextResponse.json({ error: "Malformed callback" }, { status: 400 });
  }

  // Per CLAUDE.md the worker drives state via polling; the callback is the
  // signal that Judge0 has a result ready. Surface it so the worker (or a
  // future push-mode handler) can react. For now we just log + ack.
  // eslint-disable-next-line no-console
  console.log(
    `[judge.callback] token=${body.token} status=${body.status.id} (${body.status.description})`
  );

  return NextResponse.json({ ok: true });
}
