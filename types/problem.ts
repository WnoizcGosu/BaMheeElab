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
  difficulty: "Easy" | "Medium" | "Hard" | "God";
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}
