/**
 * POST /api/submissions — stub of Jun's submit endpoint.
 *
 * Body : SubmitRequest  { problemId, language, sourceCode }
 * → 201: SubmitResponse { submissionId, status: "PENDING" }
 *
 * Creates a submission row in the mock store and enqueues a JudgeJobPayload
 * onto the "judge" BullMQ queue. UserId is hardcoded to "user-test" since
 * auth isn't wired yet — swap this for the session user when it is.
 */
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { judgeQueue } from "./queue";
import { createSubmission } from "./judge-store";
import type {
    SubmitRequest,
    SubmitResponse,
    Language,
    JudgeJobPayload,
} from "./submission";

const LANGS: ReadonlySet<Language> = new Set(["PYTHON", "C", "CPP"]);
const TEST_USER_ID = "user-test";

export async function POST(req: NextRequest) {
  let body: SubmitRequest;
  try {
    body = (await req.json()) as SubmitRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body?.problemId ||
    !body?.sourceCode ||
    !LANGS.has(body.language)
  ) {
    return NextResponse.json(
      { error: "problemId, language (PYTHON|C|CPP), sourceCode required" },
      { status: 400 }
    );
  }

  const submissionId = randomUUID();
  await createSubmission({
    id: submissionId,
    userId: TEST_USER_ID,
    problemId: body.problemId,
    language: body.language,
    sourceCode: body.sourceCode,
  });

  const payload: JudgeJobPayload = {
    submissionId,
    problemId: body.problemId,
    language: body.language,
    sourceCode: body.sourceCode,
    userId: TEST_USER_ID,
  };
  await judgeQueue.add("judge", payload, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  const res: SubmitResponse = { submissionId, status: "PENDING" };
  return NextResponse.json(res, { status: 201 });
}
