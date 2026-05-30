export const LANGUAGE_ID = {
  PYTHON: 71,
  C: 50,
  CPP: 54,
} as const;

export const JUDGE0_CALLBACK_URL = process.env.JUDGE0_CALLBACK_URL;
export const JUDGE0_CALLBACK_SECRET = process.env.JUDGE0_CALLBACK_SECRET ?? "";

export interface Judge0Result {
  status: { id: number; description: string };
  time?: string | null;
  memory?: number | null;
  compile_output?: string | null;
  stderr?: string | null;
  message?: string | null;
  stdout?: string | null;
}

export async function submitToJudge0(_payload: {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  cpu_time_limit: number;
  memory_limit: number;
  callback_url?: string;
}): Promise<{ token: string }> {
  throw new Error("submitToJudge0 is not implemented in this sample environment");
}

export async function waitForJudge0(_token: string): Promise<Judge0Result> {
  throw new Error("waitForJudge0 is not implemented in this sample environment");
}

export type SubmissionStatus =
  | "PENDING"
  | "JUDGING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export function mapJudge0Status(
  _id: number,
  _description: string
): SubmissionStatus {
  return "WRONG_ANSWER";
}
