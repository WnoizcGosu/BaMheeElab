export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "GOD";

export const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD", "GOD"];

export interface TestCase {
  id: string;
  filename: string;
  inputUrl?: string;
  outputUrl?: string;
  inputContent?: string;
  outputContent?: string;
  isPublic?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}
