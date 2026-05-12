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
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    testCaseResults: [
      {
        testCaseId: "tc-1",
        status: "Passed",
        executionTime: 20,
        memoryUsed: 12.0,
        input: "5 5",
        expectedOutput: "10",
        actualOutput: "10"
      },
      {
        testCaseId: "tc-2",
        status: "Passed",
        executionTime: 25,
        memoryUsed: 12.5,
        input: "5 15",
        expectedOutput: "20",
        actualOutput: "20"
      }
    ]
  },
  {
    id: "sub-2",
    problemId: "1",
    userId: "user-1",
    language: "Python",
    code: `a, b = map(int, input().split())
print(a - b) # Oops, wrong operator`,
    status: "Failed",
    executionTime: 42,
    memoryUsed: 12.4,
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    testCaseResults: [
      {
        testCaseId: "tc-1",
        status: "Passed",
        executionTime: 21,
        memoryUsed: 12.0,
        input: "5 5",
        expectedOutput: "10",
        actualOutput: "10" // Wait, 5 - 5 is 0. Ah, let's fix the mock logic so it's a real bug.
      },
      {
        testCaseId: "tc-2",
        status: "Failed",
        executionTime: 21,
        memoryUsed: 12.4,
        input: "5 15",
        expectedOutput: "20",
        actualOutput: "-10"
      }
    ]
  }
];

// Let's adjust tc-1 for sub-2 to fail too.
mockSubmissions[1].testCaseResults[0].actualOutput = "0";
mockSubmissions[1].testCaseResults[0].status = "Failed";

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSubmissions.find((s) => s.id === id);
}
