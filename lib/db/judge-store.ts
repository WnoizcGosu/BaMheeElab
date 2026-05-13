/**
 * In-memory mock for the Judge pipeline's DB needs.
 *
 * Replace these functions with real Prisma/Drizzle calls when the database
 * layer is wired up. Function signatures should stay identical so the worker
 * and callback route don't need to change.
 */
import type {
  Language,
  SubmissionStatus,
  SubmissionResult,
} from "@/types/submission";

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

// ---------- in-memory stores ----------

const problems = new Map<string, MockProblem>();
const submissions = new Map<string, MockSubmissionRecord>();
const leaderboard = new Map<string, MockLeaderboardEntry>(); // key: `${problemId}:${userId}`

const lbKey = (problemId: string, userId: string) => `${problemId}:${userId}`;

// ---------- seed data ----------

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

// ---------- problem ----------

export async function getProblemWithTestCases(
  problemId: string
): Promise<MockProblem | null> {
  return problems.get(problemId) ?? null;
}

// ---------- submission ----------

export async function createSubmission(
  rec: Omit<MockSubmissionRecord, "status" | "score" | "runtime" | "memory" | "resultUrl" | "submittedAt" | "results">
): Promise<MockSubmissionRecord> {
  const now = new Date().toISOString();
  const full: MockSubmissionRecord = {
    ...rec,
    status: "PENDING",
    score: 0,
    runtime: null,
    memory: null,
    resultUrl: null,
    submittedAt: now,
    results: [],
  };
  submissions.set(rec.id, full);
  return full;
}

export async function setSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
): Promise<void> {
  const s = submissions.get(submissionId);
  if (!s) throw new Error(`submission ${submissionId} not found`);
  s.status = status;
}

export async function finalizeSubmission(
  submissionId: string,
  patch: Pick<
    MockSubmissionRecord,
    "status" | "score" | "runtime" | "memory" | "resultUrl" | "results"
  >
): Promise<MockSubmissionRecord> {
  const s = submissions.get(submissionId);
  if (!s) throw new Error(`submission ${submissionId} not found`);
  Object.assign(s, patch);
  return s;
}

export async function getSubmission(
  submissionId: string
): Promise<MockSubmissionRecord | null> {
  return submissions.get(submissionId) ?? null;
}

// ---------- leaderboard (DB row, not the Redis ZSET) ----------

export async function upsertLeaderboardEntry(input: {
  userId: string;
  problemId: string;
  score: number;
  runtime: number | null;
  memory: number | null;
}): Promise<MockLeaderboardEntry> {
  const key = lbKey(input.problemId, input.userId);
  const now = new Date().toISOString();
  const existing = leaderboard.get(key);
  if (!existing || input.score > existing.bestScore) {
    const entry: MockLeaderboardEntry = {
      userId: input.userId,
      problemId: input.problemId,
      bestScore: input.score,
      bestRuntime: input.runtime,
      bestMemory: input.memory,
      updatedAt: now,
    };
    leaderboard.set(key, entry);
    return entry;
  }
  // Same score but faster runtime → update tie-breakers.
  if (
    input.score === existing.bestScore &&
    input.runtime !== null &&
    (existing.bestRuntime === null || input.runtime < existing.bestRuntime)
  ) {
    existing.bestRuntime = input.runtime;
    existing.bestMemory = input.memory;
    existing.updatedAt = now;
  }
  return existing;
}

export async function getLeaderboardEntries(
  problemId: string
): Promise<MockLeaderboardEntry[]> {
  return [...leaderboard.values()].filter((e) => e.problemId === problemId);
}
