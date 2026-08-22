/**
 * BullMQ judge worker.
 *
 * Flow (per CLAUDE.md):
 *   1. update submission -> JUDGING
 *   2. emit JUDGING socket event
 *   3. fetch Problem + TestCase[] (including hidden)
 *   4. submit all test cases to Judge0 in parallel (capped by judge0Limit)
 *   5. poll until all verdicts ready
 *   6. map verdict -> results[]
 *   7. score = (passed / total) * 100
 *   8. if any stdout > 10KB -> upload to MinIO -> resultUrl
 *   9. update Submission in DB
 *  10. upsert LeaderboardEntry + Redis ZSET
 *  11. emit final socket event
 *
 * Retries: BullMQ attempts/backoff are set at enqueue time
 * (app/api/submissions/route.ts). If every attempt fails, `worker.on("failed")`
 * marks the submission SYSTEM_ERROR so it never gets stuck at JUDGING forever
 * (see docs/adr/0001-judge-pipeline-reliability-fixes.md).
 *
 * Run: `npx tsx worker/judge.worker.ts`
 */

import { Worker, type Job } from "bullmq";
import pLimit from "p-limit";
import type {
  JudgeJobPayload,
  SubmissionResult,
  SubmissionStatus,
} from "@/types/submission";
import { JUDGE_QUEUE_NAME } from "@/lib/queue";
import { REDIS_URL, redis, LEADERBOARD_KEY } from "@/lib/redis";
import {
  LANGUAGE_ID,
  submitToJudge0,
  waitForJudge0,
  mapJudge0Status,
  type Judge0Result,
} from "@/lib/judge0";
import {
  getProblemWithTestCases,
  setSubmissionStatus,
  finalizeSubmission,
  upsertLeaderboardEntry,
  type TestCaseDTO,
} from "@/lib/db/judge-prisma-store";
import { emitSubmissionUpdate } from "@/lib/socket";
import {
  shouldOffload,
  uploadLargeOutput,
} from "@/lib/minio";

type ResultRow = SubmissionResult["results"][number];

/**
 * Judge0 (judge0.conf: NUMBER_OF_WORKERS=2) is the real bottleneck, not this
 * worker's own job concurrency. Every call into Judge0 — from any job, from
 * any test case within a job — goes through this single limiter so the two
 * dials (job concurrency x per-submission test-case fanout) can't multiply
 * past what Judge0 can actually drain within the poll timeout.
 */
const judge0Limit = pLimit(Number(process.env.JUDGE0_MAX_CONCURRENCY || 2));

function parseRuntimeSec(s: string | null): number | null {
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1000); // seconds -> ms
}

/** Decide overall submission status from per-testcase verdicts. */
function aggregateStatus(perCase: SubmissionStatus[]): SubmissionStatus {
  if (perCase.every((s) => s === "ACCEPTED")) return "ACCEPTED";
  // Priority: compile error trumps everything (it's the same for all cases anyway),
  // then runtime/memory/time, then wrong answer.
  const order: SubmissionStatus[] = [
    "COMPILE_ERROR",
    "MEMORY_LIMIT",
    "TIME_LIMIT",
    "RUNTIME_ERROR",
    "WRONG_ANSWER",
  ];
  for (const s of order) if (perCase.includes(s)) return s;
  return "WRONG_ANSWER";
}

async function maybeOffload(
  submissionId: string,
  tcId: string,
  output: string | null
): Promise<{ stored: string | null; url: string | null }> {
  if (output === null) return { stored: null, url: null };
  if (!shouldOffload(output)) return { stored: output, url: null };
  const url = await uploadLargeOutput({
    submissionId,
    name: `stdout-${tcId}.txt`,
    body: output,
  });
  return { stored: null, url };
}

async function judgeOneTestCase(
  submissionId: string,
  tc: TestCaseDTO,
  language: JudgeJobPayload["language"],
  sourceCode: string,
  timeLimitMs: number,
  memoryLimitMb: number
): Promise<{ row: ResultRow; status: SubmissionStatus; resultUrl: string | null }> {
  const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));

  const r: Judge0Result = await judge0Limit(async () => {
    const { token } = await submitToJudge0({
      source_code: sourceCode,
      language_id: LANGUAGE_ID[language],
      stdin: tc.input,
      expected_output: tc.expectedOutput,
      cpu_time_limit: timeLimitSec,
      wall_time_limit: timeLimitSec,
      memory_limit: memoryLimitMb * 1024, // MB -> KB
    });
    return waitForJudge0(token);
  });
  const status = mapJudge0Status(r.status.id, r.status.description);
  const passed = status === "ACCEPTED";
  const runtime = parseRuntimeSec(r.time);
  const memory = r.memory ?? null;

  const errorMessage =
    r.compile_output ||
    r.stderr ||
    r.message ||
    (status !== "ACCEPTED" && status !== "WRONG_ANSWER"
      ? r.status.description
      : null);

  const offloaded = await maybeOffload(submissionId, tc.id, r.stdout);

  const row: ResultRow = {
    testCaseId: tc.id,
    passed,
    runtime,
    memory,
    actualOutput: tc.isHidden ? null : offloaded.stored,
    expectedOutput: tc.isHidden ? null : tc.expectedOutput,
    errorMessage,
  };
  return { row, status, resultUrl: offloaded.url };
}

async function processJob(job: Job<JudgeJobPayload>) {
  const { submissionId, problemId, language, sourceCode, userId } = job.data;

  // 1 + 2: JUDGING
  await setSubmissionStatus(submissionId, "JUDGING");
  emitSubmissionUpdate(userId, {
    submissionId,
    status: "JUDGING",
    score: 0,
    runtime: null,
    memory: null,
  });

  // 3: load problem + tests (hidden included)
  const problem = await getProblemWithTestCases(problemId);
  if (!problem) throw new Error(`problem ${problemId} not found`);
  if (problem.testCases.length === 0) {
    throw new Error(`problem ${problemId} has no test cases`);
  }

  // 4 + 5: run all in parallel, each one polls itself to completion
  const perCase = await Promise.all(
    problem.testCases.map((tc) =>
      judgeOneTestCase(
        submissionId,
        tc,
        language,
        sourceCode,
        problem.timeLimit,
        problem.memoryLimit
      )
    )
  );

  // 6: rows + statuses
  const results: ResultRow[] = perCase.map((p) => p.row);
  const statuses: SubmissionStatus[] = perCase.map((p) => p.status);

  // 7: score
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  // aggregate runtime/memory across cases (max — worst case)
  const runtimes = results.map((r) => r.runtime).filter((v): v is number => v !== null);
  const memories = results.map((r) => r.memory).filter((v): v is number => v !== null);
  const runtime = runtimes.length ? Math.max(...runtimes) : null;
  const memory = memories.length ? Math.max(...memories) : null;

  // 8: resultUrl — point at the first offloaded blob if any
  const resultUrl = perCase.find((p) => p.resultUrl)?.resultUrl ?? null;

  // overall status
  const status = aggregateStatus(statuses);

  // 9: persist
  await finalizeSubmission(submissionId, {
    status,
    score,
    runtime,
    memory,
    resultUrl,
    results,
  });

  // 10: leaderboard (DB row + Redis ZSET)
  await upsertLeaderboardEntry({
    userId,
    problemId,
    score,
    runtime,
    memory,
  });
  // ZADD only updates if the new score is higher (GT) so we keep the best.
  await redis.zadd(LEADERBOARD_KEY(problemId), "GT", score, userId);

  // 11: final emit
  emitSubmissionUpdate(userId, {
    submissionId,
    status,
    score,
    runtime,
    memory,
  });

  return { submissionId, status, score };
}

const worker = new Worker<JudgeJobPayload>(JUDGE_QUEUE_NAME, processJob, {
  connection: { url: REDIS_URL },
  // Judge0 throughput is bounded by judge0Limit above, not this. This only
  // caps how many jobs the worker pulls off the queue at once.
  concurrency: Number(process.env.JUDGE_WORKER_CONCURRENCY || 10),
});

worker.on("ready", () => {
  // eslint-disable-next-line no-console
  console.log(`[worker] judge worker ready, queue="${JUDGE_QUEUE_NAME}"`);
});

worker.on("failed", (job, err) => {
  const attemptsMade = job?.attemptsMade ?? 0;
  const attemptsMax = job?.opts?.attempts ?? 1;

  // eslint-disable-next-line no-console
  console.error(
    `[worker] job ${job?.id ?? "?"} failed for submission ${job?.data?.submissionId ?? "?"} ` +
      `(attempt ${attemptsMade}/${attemptsMax}):`,
    err
  );

  // Still retries left -> stay silent, submission is still shown as JUDGING.
  if (attemptsMade < attemptsMax) return;

  const submissionId = job?.data?.submissionId;
  const userId = job?.data?.userId;
  if (!submissionId || !userId) return;

  // Final attempt exhausted: this is our fault, not the student's code, and
  // the submission must not stay stuck at JUDGING forever.
  (async () => {
    await finalizeSubmission(submissionId, {
      status: "SYSTEM_ERROR",
      score: 0,
      runtime: null,
      memory: null,
      resultUrl: null,
      results: [],
    });
    emitSubmissionUpdate(userId, {
      submissionId,
      status: "SYSTEM_ERROR",
      score: 0,
      runtime: null,
      memory: null,
    });
  })().catch((finalizeErr) => {
    // eslint-disable-next-line no-console
    console.error(
      `[worker] failed to mark submission ${submissionId} as SYSTEM_ERROR:`,
      finalizeErr
    );
  });
});

worker.on("completed", (job, ret) => {
  // eslint-disable-next-line no-console
  console.log(`[worker] job ${job.id} done:`, ret);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`[worker] received ${signal}, draining...`);
  await worker.close();
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
