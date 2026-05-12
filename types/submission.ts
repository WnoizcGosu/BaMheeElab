export type SubmissionStatus = "Passed" | "Failed";

export type TestCaseStatus = "Passed" | "Failed";

export interface TestCaseResult {
  testCaseId: string;
  status: TestCaseStatus;
  executionTime: number; // in ms
  memoryUsed: number; // in MB
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string; // Optional error message if runtime/compilation error occurs
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  executionTime: number; // Total or max execution time
  memoryUsed: number; // Total or max memory used
  testCaseResults: TestCaseResult[];
  createdAt: Date;
}
