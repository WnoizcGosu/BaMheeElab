import { Problem } from "@/types/problem";

// In-memory mock database
const problems: Problem[] = [
  {
    id: "1",
    title: "A+B Problem",
    description: "Calculate the sum of a and b.",
    difficulty: "EASY",
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-1",
        filename: "input_1.txt",
        inputUrl: "s3://bucket/testcases/input_1.txt",
        outputUrl: "s3://bucket/testcases/output_1.txt",
        inputContent: "5 5",
        outputContent: "10",
        isPublic: true,
      },
      {
        id: "tc-2",
        filename: "input_2.txt",
        inputUrl: "s3://bucket/testcases/input_2.txt",
        outputUrl: "s3://bucket/testcases/output_2.txt",
        inputContent: "5 15",
        outputContent: "20",
        isPublic: false,
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getProblems(): Promise<Problem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return problems;
}

export async function getProblemById(id: string): Promise<Problem | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return problems.find((p) => p.id === id);
}

export async function createProblem(data: Omit<Problem, "id" | "createdAt" | "updatedAt">): Promise<Problem> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const newProblem: Problem = {
    ...data,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  problems.push(newProblem);
  return newProblem;
}
