/**
 * GET /api/submissions/:id — full result for one submission.
 * Shape: SubmissionResult from CLAUDE.md.
 */
import { NextResponse } from "next/server";
import { getSubmission } from "@/lib/db/judge-store";
import type { SubmissionResult } from "@/types/submission";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const s = await getSubmission(id);
  if (!s) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const result: SubmissionResult = {
    id: s.id,
    status: s.status,
    score: s.score,
    runtime: s.runtime,
    memory: s.memory,
    language: s.language,
    submittedAt: s.submittedAt,
    resultUrl: s.resultUrl,
    results: s.results,
  };
  return NextResponse.json(result);
}
