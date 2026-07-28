// lib/judge0.ts
import type { Language, SubmissionStatus } from "@/types/submission";

export const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "http://127.0.0.1:2358";
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
  wall_time_limit?: number;    // seconds
  memory_limit?: number;       // KB
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
export async function submitToJudge0(params: any) {
  // 🎯 1. ส่งเป็น Base64 เพื่อป้องกันปัญหาอักขระพิเศษและภาษาไทย
  const url = `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`;

  const payload = {
    ...params,
    source_code: params.source_code ? Buffer.from(params.source_code, "utf-8").toString("base64") : null,
    stdin: params.stdin ? Buffer.from(params.stdin, "utf-8").toString("base64") : null,
    expected_output: params.expected_output ? Buffer.from(params.expected_output, "utf-8").toString("base64") : null,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Judge0 submit failed: ${response.status} ${err}`);
  }

  return response.json();
}

/**
 * ดึงผลลัพธ์จาก Judge0 และถอดรหัส Base64 กลับเป็นอักขระปกติ (UTF-8)
 */
export async function getJudge0Result(token: string): Promise<Judge0Result> {
  // 🎯 2. ต้องดึงผลแบบ base64_encoded=true ด้วย
  const url = `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=*`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Judge0 get failed: ${res.status} ${await res.text()}`);
  }
  
  const data = await res.json();

  // 🎯 3. ถอดรหัส Base64 กลับมาเป็นอักขระภาษาคน (ถ้ามีข้อมูลส่งกลับมา)
  if (data.stdout) data.stdout = Buffer.from(data.stdout, "base64").toString("utf-8");
  if (data.stderr) data.stderr = Buffer.from(data.stderr, "base64").toString("utf-8");
  if (data.compile_output) data.compile_output = Buffer.from(data.compile_output, "base64").toString("utf-8");
  if (data.message) data.message = Buffer.from(data.message, "base64").toString("utf-8");

  return data;
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