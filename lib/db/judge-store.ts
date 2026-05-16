/**
 * Judge pipeline data layer.
 *
 * Backed by Postgres via Prisma (schema lives in prisma/schema.prisma, owned
 * by the infra team). Function signatures are camelCase to match the rest of
 * the codebase; the Prisma schema uses snake_case columns, so we map at the
 * boundary inside each function.
 *
 * Leaderboard ranking ZSET lives in Redis (lib/redis.ts) — this file persists
 * the authoritative LeaderboardEntry row only.
 */
import type {
  Language,
  SubmissionStatus,
  SubmissionResult,
} from "@/types/submission";
import { prisma } from "@/lib/prisma";

export interface MockTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface MockProblem {
  id: string;
  title: string;
  timeLimit: number;   // ms
  memoryLimit: number; // MB
  testCases: MockTestCase[];
}

export interface MockSubmissionRecord {
  id: string;
  userId: string;
  problemId: string;
  language: Language;
  sourceCode: string;
  status: SubmissionStatus;
  score: number;
  runtime: number | null;
  memory: number | null;
  resultUrl: string | null;
  submittedAt: string;
  results: SubmissionResult["results"];
}

export interface MockLeaderboardEntry {
  userId: string;
  problemId: string;
  bestScore: number;
  bestRuntime: number | null;
  bestMemory: number | null;
  updatedAt: string;
}

type ResultRow = SubmissionResult["results"][number];

// ---------- problems ----------

export async function getProblemWithTestCases(
  problemId: string
): Promise<MockProblem | null> {
  const p = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      test_cases: { orderBy: { order_index: "asc" } },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    timeLimit: p.time_limit,
    memoryLimit: p.memory_limit,
    testCases: p.test_cases.map((tc) => {
      if (tc.input_content == null || tc.output_content == null) {
        throw new Error(
          `test case ${tc.id} has only URL storage (${tc.input_url}); ` +
            `inline content fetch from MinIO not implemented yet`
        );
      }
      return {
        id: tc.id,
        input: tc.input_content,
        expectedOutput: tc.output_content,
        isHidden: !tc.is_public,
      };
    }),
  };
}

// ---------- submission ----------

export async function createSubmission(
  rec: Omit<
    MockSubmissionRecord,
    "status" | "score" | "runtime" | "memory" | "resultUrl" | "submittedAt" | "results"
  >
): Promise<MockSubmissionRecord> {
  const s = await prisma.submission.create({
    data: {
      id: rec.id,
      user_id: rec.userId,
      problem_id: rec.problemId,
      language: rec.language,
      source_code: rec.sourceCode,
    },
  });
  return {
    id: s.id,
    userId: s.user_id,
    problemId: s.problem_id,
    language: s.language as Language,
    sourceCode: s.source_code,
    status: s.status as SubmissionStatus,
    score: s.score,
    runtime: s.runtime,
    memory: s.memory,
    resultUrl: s.result_url,
    submittedAt: s.submitted_at.toISOString(),
    results: [],
  };
}

export async function getSubmission(
  submissionId: string
): Promise<MockSubmissionRecord | null> {
  const s = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      test_case_results: {
        include: { test_case: true },
      },
    },
  });
  if (!s) return null;
  const results: ResultRow[] = s.test_case_results.map((r) => ({
    testCaseId: r.test_case_id,
    passed: r.passed,
    runtime: r.runtime,
    memory: r.memory,
    actualOutput: r.actual_output,
    expectedOutput: r.test_case.is_public ? r.test_case.output_content : null,
    errorMessage: r.error_message,
  }));
  return {
    id: s.id,
    userId: s.user_id,
    problemId: s.problem_id,
    language: s.language as Language,
    sourceCode: s.source_code,
    status: s.status as SubmissionStatus,
    score: s.score,
    runtime: s.runtime,
    memory: s.memory,
    resultUrl: s.result_url,
    submittedAt: s.submitted_at.toISOString(),
    results,
  };
}

export async function setSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
): Promise<void> {
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status },
  });
}

export async function finalizeSubmission(
  submissionId: string,
  patch: Pick<
    MockSubmissionRecord,
    "status" | "score" | "runtime" | "memory" | "resultUrl" | "results"
  >
): Promise<MockSubmissionRecord> {
  // Re-runs can happen on retry; wipe prior rows so we don't double-write.
  await prisma.$transaction([
    prisma.testCaseResult.deleteMany({ where: { submission_id: submissionId } }),
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: patch.status,
        score: patch.score,
        runtime: patch.runtime,
        memory: patch.memory,
        result_url: patch.resultUrl,
        judged_at: new Date(),
        test_case_results: {
          create: patch.results.map((r) => ({
            test_case_id: r.testCaseId,
            passed: r.passed,
            status: r.passed ? "ACCEPTED" : patch.status,
            runtime: r.runtime,
            memory: r.memory,
            actual_output: r.actualOutput,
            error_message: r.errorMessage,
          })),
        },
      },
    }),
  ]);

  const updated = await getSubmission(submissionId);
  if (!updated) throw new Error(`submission ${submissionId} vanished after finalize`);
  return updated;
}

// ---------- leaderboard (authoritative row; ZSET in Redis is for ranking) ----------

export async function upsertLeaderboardEntry(input: {
  userId: string;
  problemId: string;
  score: number;
  runtime: number | null;
  memory: number | null;
}): Promise<MockLeaderboardEntry> {
  const key = {
    user_id_problem_id: { user_id: input.userId, problem_id: input.problemId },
  };

  const existing = await prisma.leaderboardEntry.findUnique({ where: key });

  let entry;
  if (!existing || input.score > existing.best_score) {
    entry = await prisma.leaderboardEntry.upsert({
      where: key,
      create: {
        user_id: input.userId,
        problem_id: input.problemId,
        best_score: input.score,
        best_runtime: input.runtime,
        best_memory: input.memory,
      },
      update: {
        best_score: input.score,
        best_runtime: input.runtime,
        best_memory: input.memory,
      },
    });
  } else if (
    input.score === existing.best_score &&
    input.runtime !== null &&
    (existing.best_runtime === null || input.runtime < existing.best_runtime)
  ) {
    entry = await prisma.leaderboardEntry.update({
      where: key,
      data: {
        best_runtime: input.runtime,
        best_memory: input.memory,
      },
    });
  } else {
    entry = existing;
  }

  return {
    userId: entry.user_id,
    problemId: entry.problem_id,
    bestScore: entry.best_score,
    bestRuntime: entry.best_runtime,
    bestMemory: entry.best_memory,
    updatedAt: entry.updated_at.toISOString(),
  };
}

export async function getLeaderboardEntries(
  problemId: string
): Promise<MockLeaderboardEntry[]> {
  const rows = await prisma.leaderboardEntry.findMany({
    where: { problem_id: problemId },
    orderBy: [{ best_score: "desc" }, { best_runtime: "asc" }],
  });
  return rows.map((r) => ({
    userId: r.user_id,
    problemId: r.problem_id,
    bestScore: r.best_score,
    bestRuntime: r.best_runtime,
    bestMemory: r.best_memory,
    updatedAt: r.updated_at.toISOString(),
  }));
}
