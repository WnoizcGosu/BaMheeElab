/**
 * Mock DB for the Judge pipeline.
 *
 * Submissions + leaderboard entries are persisted in Redis so the enqueue
 * script (one process) and the worker (another process) share state. Problems
 * stay in-memory since they're identical seed data in every process.
 *
 * Replace these functions with real Prisma/Drizzle calls when the database
 * layer is wired up — function signatures should stay identical so the worker
 * and callback route don't need to change.
 */
import type {
  Language,
  SubmissionStatus,
  SubmissionResult,
} from "@/types/submission";
import { redis } from "@/lib/redis";

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

// ---------- redis keys ----------

const subKey = (id: string) => `mock:submission:${id}`;
const lbKey = (problemId: string, userId: string) =>
  `mock:lb:${problemId}:${userId}`;
const lbIndexKey = (problemId: string) => `mock:lb-index:${problemId}`;

// ---------- problems (in-memory seed) ----------

const problems = new Map<string, MockProblem>();

problems.set("p-1", {
  id: "p-1",
  title: "A+B Problem",
  timeLimit: 1000,
  memoryLimit: 256,
  testCases: [
    { id: "tc-1", input: "5 5", expectedOutput: "10", isHidden: false },
    { id: "tc-2", input: "5 15", expectedOutput: "20", isHidden: false },
    { id: "tc-3", input: "100 200", expectedOutput: "300", isHidden: true },
    { id: "tc-4", input: "-1 1", expectedOutput: "0", isHidden: true },
  ],
});

problems.set("p-2", {
  id: "p-2",
  title: "Echo",
  timeLimit: 1000,
  memoryLimit: 256,
  testCases: [
    { id: "tc-1", input: "hello", expectedOutput: "hello", isHidden: false },
    { id: "tc-2", input: "world", expectedOutput: "world", isHidden: true },
  ],
});

export async function getProblemWithTestCases(
  problemId: string
): Promise<MockProblem | null> {
  return problems.get(problemId) ?? null;
}

// ---------- submission ----------

export async function createSubmission(
  rec: Omit<
    MockSubmissionRecord,
    "status" | "score" | "runtime" | "memory" | "resultUrl" | "submittedAt" | "results"
  >
): Promise<MockSubmissionRecord> {
  const full: MockSubmissionRecord = {
    ...rec,
    status: "PENDING",
    score: 0,
    runtime: null,
    memory: null,
    resultUrl: null,
    submittedAt: new Date().toISOString(),
    results: [],
  };
  await redis.set(subKey(rec.id), JSON.stringify(full));
  return full;
}

export async function getSubmission(
  submissionId: string
): Promise<MockSubmissionRecord | null> {
  const raw = await redis.get(subKey(submissionId));
  return raw ? (JSON.parse(raw) as MockSubmissionRecord) : null;
}

export async function setSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
): Promise<void> {
  const s = await getSubmission(submissionId);
  if (!s) throw new Error(`submission ${submissionId} not found`);
  s.status = status;
  await redis.set(subKey(submissionId), JSON.stringify(s));
}

export async function finalizeSubmission(
  submissionId: string,
  patch: Pick<
    MockSubmissionRecord,
    "status" | "score" | "runtime" | "memory" | "resultUrl" | "results"
  >
): Promise<MockSubmissionRecord> {
  const s = await getSubmission(submissionId);
  if (!s) throw new Error(`submission ${submissionId} not found`);
  Object.assign(s, patch);
  await redis.set(subKey(submissionId), JSON.stringify(s));
  return s;
}

// ---------- leaderboard (DB row, separate from the Redis ZSET) ----------

export async function upsertLeaderboardEntry(input: {
  userId: string;
  problemId: string;
  score: number;
  runtime: number | null;
  memory: number | null;
}): Promise<MockLeaderboardEntry> {
  const key = lbKey(input.problemId, input.userId);
  const now = new Date().toISOString();
  const raw = await redis.get(key);
  const existing = raw ? (JSON.parse(raw) as MockLeaderboardEntry) : null;

  let entry: MockLeaderboardEntry;
  if (!existing || input.score > existing.bestScore) {
    entry = {
      userId: input.userId,
      problemId: input.problemId,
      bestScore: input.score,
      bestRuntime: input.runtime,
      bestMemory: input.memory,
      updatedAt: now,
    };
  } else if (
    input.score === existing.bestScore &&
    input.runtime !== null &&
    (existing.bestRuntime === null || input.runtime < existing.bestRuntime)
  ) {
    entry = {
      ...existing,
      bestRuntime: input.runtime,
      bestMemory: input.memory,
      updatedAt: now,
    };
  } else {
    return existing;
  }

  await redis.set(key, JSON.stringify(entry));
  await redis.sadd(lbIndexKey(input.problemId), input.userId);
  return entry;
}

export async function getLeaderboardEntries(
  problemId: string
): Promise<MockLeaderboardEntry[]> {
  const userIds = await redis.smembers(lbIndexKey(problemId));
  if (userIds.length === 0) return [];
  const raws = await redis.mget(
    ...userIds.map((u) => lbKey(problemId, u))
  );
  return raws
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as MockLeaderboardEntry);
}
