import type { Language, SubmissionStatus } from "@/types/submission";

export const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "http://localhost:2358";
export const JUDGE0_CALLBACK_URL = process.env.JUDGE0_CALLBACK_URL || "";
export const JUDGE0_CALLBACK_SECRET =
  process.env.JUDGE0_CALLBACK_SECRET || "dev-secret";

export const LANGUAGE_ID: Record<Language, number> = {
  PYTHON: 71,
  C: 50,
  CPP: 54,
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;     // seconds
  memory_limit?: number;       // KB
  callback_url?: string;
}

export interface Judge0Result {
  token: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;   // seconds, e.g. "0.142"
  memory: number | null; // KB
}

/**
 * Submit a single source+stdin to Judge0. Returns the token.
 * wait=false → async; we poll or rely on callback.
 */
export async function submitToJudge0(
  payload: Judge0Submission
): Promise<{ token: string }> {
  const url = `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Judge0 submit failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getJudge0Result(token: string): Promise<Judge0Result> {
  const url = `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=*`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Judge0 get failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/**
 * Poll Judge0 until a token finishes (status.id > 2) or until timeout.
 */
export async function waitForJudge0(
  token: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<Judge0Result> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const intervalMs = opts.intervalMs ?? 500;
  const started = Date.now();
  while (true) {
    const r = await getJudge0Result(token);
    if (r.status.id > 2) return r;
    if (Date.now() - started > timeoutMs) {
      throw new Error(`Judge0 poll timeout for token ${token}`);
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
}

/**
 * Map Judge0 status id → our SubmissionStatus.
 * 1,2 = still running (shouldn't be passed in once finished)
 * 3   = ACCEPTED
 * 4   = WRONG_ANSWER
 * 5   = TIME_LIMIT
 * 6   = COMPILE_ERROR
 * 7-12 = RUNTIME_ERROR (incl. memory limit handled separately by description)
 */
export function mapJudge0Status(
  judge0StatusId: number,
  description?: string
): SubmissionStatus {
  switch (judge0StatusId) {
    case 3:
      return "ACCEPTED";
    case 4:
      return "WRONG_ANSWER";
    case 5:
      return "TIME_LIMIT";
    case 6:
      return "COMPILE_ERROR";
    default:
      if (judge0StatusId >= 7 && judge0StatusId <= 12) {
        if (description && /memory/i.test(description)) return "MEMORY_LIMIT";
        return "RUNTIME_ERROR";
      }
      return "RUNTIME_ERROR";
  }
}
