import { Submission } from "@/types/submission";

export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    problemId: "1",
    userId: "user-1",
    language: "Python",
    code: `a, b = map(int, input().split())
print(a + b)`,
    status: "Passed",
    executionTime: 45,
    memoryUsed: 12.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    testCaseResults: [
      {
        testCaseId: "tc-1",
        status: "Passed",
        executionTime: 20,
        memoryUsed: 12.0,
        input: "5 5",
        expectedOutput: "10",
        actualOutput: "10",
      },
      {
        testCaseId: "tc-2",
        status: "Passed",
        executionTime: 25,
        memoryUsed: 12.5,
        input: "5 15",
        expectedOutput: "20",
        actualOutput: "20",
      },
      {
        testCaseId: "tc-3",
        status: "Passed",
        executionTime: 22,
        memoryUsed: 12.2,
        input: "1000000000 1000000000",
        expectedOutput: "2000000000",
        actualOutput: "2000000000",
      },
    ],
  },
  {
    id: "sub-2",
    problemId: "1",
    userId: "user-1",
    language: "Python",
    code: `a, b = map(int, input().split())
print(a - b)  # wrong operator`,
    status: "Failed",
    executionTime: 42,
    memoryUsed: 12.4,
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    testCaseResults: [
      {
        testCaseId: "tc-1",
        status: "Failed",
        executionTime: 21,
        memoryUsed: 12.0,
        input: "5 5",
        expectedOutput: "10",
        actualOutput: "0",
      },
      {
        testCaseId: "tc-2",
        status: "Failed",
        executionTime: 21,
        memoryUsed: 12.4,
        input: "5 15",
        expectedOutput: "20",
        actualOutput: "-10",
      },
      {
        testCaseId: "tc-3",
        status: "Passed",
        executionTime: 19,
        memoryUsed: 12.1,
        input: "0 0",
        expectedOutput: "0",
        actualOutput: "0",
      },
    ],
  },
];

export async function getSubmissions(): Promise<Submission[]> {
  return mockSubmissions;
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockSubmissions.find((s) => s.id === id);
}
