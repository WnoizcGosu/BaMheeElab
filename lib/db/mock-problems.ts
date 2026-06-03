import { Problem, TestCase } from "@/types/problem";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "problems.json");

// Helper: read problems from JSON file
function readProblems(): Problem[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return data.map((p: Record<string, unknown>) => ({
      ...p,
      createdAt: new Date(p.createdAt as string),
      updatedAt: new Date(p.updatedAt as string),
    }));
  } catch {
    return [];
  }
}

// Helper: write problems to JSON file
function writeProblems(problems: Problem[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(problems, null, 2), "utf-8");
}

export async function getProblems(): Promise<Problem[]> {
  return readProblems();
}

export async function getProblemById(id: string): Promise<Problem | undefined> {
  const problems = readProblems();
  return problems.find((p) => p.id === id);
}

export async function createProblem(data: Omit<Problem, "id" | "createdAt" | "updatedAt">): Promise<Problem> {
  const problems = readProblems();

  const newProblem: Problem = {
    ...data,
    id: (problems.length + 1).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  problems.push(newProblem);
  writeProblems(problems);
  return newProblem;
}

export async function updateProblem(id: string, data: Partial<Omit<Problem, "id" | "createdAt">>): Promise<Problem | undefined> {
  const problems = readProblems();
  const index = problems.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const updatedProblem = {
    ...problems[index],
    ...data,
    updatedAt: new Date(),
  };

  problems[index] = updatedProblem;
  writeProblems(problems);
  return updatedProblem;
}

export async function addTestCasesToProblem(
  id: string,
  newCases: TestCase[]
): Promise<Problem | undefined> {
  const problem = await getProblemById(id);
  if (!problem) return undefined;

  return updateProblem(id, {
    testCases: [...problem.testCases, ...newCases],
  });
}

export async function deleteProblem(id: string): Promise<boolean> {
  const problems = readProblems();
  const index = problems.findIndex((p) => p.id === id);
  if (index === -1) return false;

  problems.splice(index, 1);
  writeProblems(problems);
  return true;
}
