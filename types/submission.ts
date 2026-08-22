export type Language = "PYTHON" | "C" | "CPP";

export type SubmissionStatus =
  | "PENDING"
  | "JUDGING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "SYSTEM_ERROR";

export interface SubmitRequest {
  problemId: string;
  language: Language;
  sourceCode: string;
}

export interface SubmitResponse {
  submissionId: string;
  status: "PENDING";
}

export interface SubmissionUpdateEvent {
  submissionId: string;
  status: SubmissionStatus;
  score: number;
  runtime: number | null;
  memory: number | null;
}

export interface SubmissionResult {
  id: string;
  status: SubmissionStatus;
  score: number;
  runtime: number | null;
  memory: number | null;
  language: Language;
  submittedAt: string;
  resultUrl: string | null;
  results: {
    testCaseId: string;
    passed: boolean;
    runtime: number | null;
    memory: number | null;
    actualOutput: string | null;
    expectedOutput: string | null;
    errorMessage: string | null;
  }[];
}

export interface JudgeJobPayload {
  submissionId: string;
  problemId: string;
  language: Language;
  sourceCode: string;
  userId: string;
}
