import { Problem } from "@/types/problem";

// In-memory mock database
const problems: Problem[] = [
  // ==========================================
  // General / Programming Problems
  // ==========================================
  {
    id: "1",
    title: "A+B Problem",
    description: "Given two integers A and B, calculate and output their sum.\n\n**Input:** Two integers A and B separated by a space (1 ≤ A, B ≤ 10^9)\n**Output:** A single integer — the sum of A and B.",
    category: "General",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-1",
        filename: "input_1.txt",
        inputContent: "5 5",
        outputContent: "10",
        isPublic: true,
      },
      {
        id: "tc-2",
        filename: "input_2.txt",
        inputContent: "5 15",
        outputContent: "20",
        isPublic: true,
      },
      {
        id: "tc-3",
        filename: "input_3.txt",
        inputContent: "1000000000 1000000000",
        outputContent: "2000000000",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Fibonacci Number",
    description: "Given an integer N, find the N-th Fibonacci number. The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n ≥ 2.\n\n**Input:** A single integer N (0 ≤ N ≤ 45)\n**Output:** The N-th Fibonacci number.",
    category: "General",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-4",
        filename: "input_1.txt",
        inputContent: "0",
        outputContent: "0",
        isPublic: true,
      },
      {
        id: "tc-5",
        filename: "input_2.txt",
        inputContent: "10",
        outputContent: "55",
        isPublic: true,
      },
      {
        id: "tc-6",
        filename: "input_3.txt",
        inputContent: "45",
        outputContent: "1134903170",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Palindrome Check",
    description: "Given a string S consisting of lowercase English letters, determine whether S is a palindrome (reads the same forwards and backwards).\n\n**Input:** A single string S (1 ≤ |S| ≤ 10^5)\n**Output:** Print `YES` if S is a palindrome, otherwise print `NO`.",
    category: "General",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-7",
        filename: "input_1.txt",
        inputContent: "racecar",
        outputContent: "YES",
        isPublic: true,
      },
      {
        id: "tc-8",
        filename: "input_2.txt",
        inputContent: "hello",
        outputContent: "NO",
        isPublic: true,
      },
      {
        id: "tc-9",
        filename: "input_3.txt",
        inputContent: "abacaba",
        outputContent: "YES",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "FizzBuzz",
    description: "Given an integer N, print numbers from 1 to N. But for multiples of 3, print `Fizz` instead of the number, for multiples of 5 print `Buzz`, and for multiples of both 3 and 5 print `FizzBuzz`.\n\n**Input:** A single integer N (1 ≤ N ≤ 1000)\n**Output:** N lines, each containing either the number, `Fizz`, `Buzz`, or `FizzBuzz`.",
    category: "General",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-10",
        filename: "input_1.txt",
        inputContent: "5",
        outputContent: "1\n2\nFizz\n4\nBuzz",
        isPublic: true,
      },
      {
        id: "tc-11",
        filename: "input_2.txt",
        inputContent: "15",
        outputContent: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
        isPublic: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Two Sum",
    description: "Given an array of N integers and a target value T, find two distinct indices i and j such that arr[i] + arr[j] = T. Output the two indices (0-indexed) in ascending order.\n\n**Input:**\n- Line 1: Two integers N and T (2 ≤ N ≤ 10^5, -10^9 ≤ T ≤ 10^9)\n- Line 2: N space-separated integers\n\n**Output:** Two space-separated indices i and j (i < j). It is guaranteed that exactly one solution exists.",
    category: "General",
    difficulty: "Medium",
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-12",
        filename: "input_1.txt",
        inputContent: "4 9\n2 7 11 15",
        outputContent: "0 1",
        isPublic: true,
      },
      {
        id: "tc-13",
        filename: "input_2.txt",
        inputContent: "3 6\n3 2 4",
        outputContent: "1 2",
        isPublic: true,
      },
      {
        id: "tc-14",
        filename: "input_3.txt",
        inputContent: "5 -1\n-3 4 3 90 1",
        outputContent: "0 2",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Longest Common Subsequence",
    description: "Given two strings S1 and S2, find the length of their Longest Common Subsequence (LCS). A subsequence is a sequence that can be derived by deleting some (or no) elements without changing the order of remaining elements.\n\n**Input:**\n- Line 1: String S1 (1 ≤ |S1| ≤ 1000)\n- Line 2: String S2 (1 ≤ |S2| ≤ 1000)\n\n**Output:** A single integer — the length of the LCS.",
    category: "General",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 512,
    testCases: [
      {
        id: "tc-15",
        filename: "input_1.txt",
        inputContent: "abcde\nace",
        outputContent: "3",
        isPublic: true,
      },
      {
        id: "tc-16",
        filename: "input_2.txt",
        inputContent: "abc\nabc",
        outputContent: "3",
        isPublic: true,
      },
      {
        id: "tc-17",
        filename: "input_3.txt",
        inputContent: "abc\ndef",
        outputContent: "0",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================================
  // Statistical Programming Problems
  // ==========================================
  {
    id: "7",
    title: "Mean and Variance",
    description: "Given a list of N numbers, calculate the **population mean** and **population variance**.\n\n**Formulas:**\n- Mean: μ = (Σxᵢ) / N\n- Variance: σ² = Σ(xᵢ - μ)² / N\n\n**Input:**\n- Line 1: An integer N (1 ≤ N ≤ 10^5)\n- Line 2: N space-separated real numbers\n\n**Output:** Two values separated by a space — mean and variance, each rounded to 2 decimal places.",
    category: "Stat",
    difficulty: "Easy",
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-18",
        filename: "input_1.txt",
        inputContent: "5\n1 2 3 4 5",
        outputContent: "3.00 2.00",
        isPublic: true,
      },
      {
        id: "tc-19",
        filename: "input_2.txt",
        inputContent: "4\n10 20 30 40",
        outputContent: "25.00 125.00",
        isPublic: true,
      },
      {
        id: "tc-20",
        filename: "input_3.txt",
        inputContent: "3\n5.5 2.3 8.7",
        outputContent: "5.50 6.83",
        isPublic: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    title: "Standard Deviation & Z-Score",
    description: "Given a list of N numbers and a query value X, compute the **population standard deviation** and the **Z-score** of X.\n\n**Formulas:**\n- Standard Deviation: σ = √(Σ(xᵢ - μ)² / N)\n- Z-Score: z = (X - μ) / σ\n\n**Input:**\n- Line 1: Two values — integer N and real number X (1 ≤ N ≤ 10^5)\n- Line 2: N space-separated real numbers\n\n**Output:** Two values separated by a space — σ and z, each rounded to 4 decimal places.",
    category: "Stat",
    difficulty: "Medium",
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-21",
        filename: "input_1.txt",
        inputContent: "5 7\n2 4 6 8 10",
        outputContent: "2.8284 0.3536",
        isPublic: true,
      },
      {
        id: "tc-22",
        filename: "input_2.txt",
        inputContent: "4 100\n80 90 100 110",
        outputContent: "11.1803 0.4472",
        isPublic: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    title: "Simple Linear Regression",
    description: "Given N data points (x, y), compute the coefficients of the simple linear regression line y = a + bx using the **least squares method**.\n\n**Formulas:**\n- b = (NΣxᵢyᵢ - ΣxᵢΣyᵢ) / (NΣxᵢ² - (Σxᵢ)²)\n- a = ȳ - bx̄\n\n**Input:**\n- Line 1: An integer N (2 ≤ N ≤ 10^5)\n- Next N lines: Two space-separated real numbers xᵢ and yᵢ\n\n**Output:** Two values separated by a space — intercept (a) and slope (b), each rounded to 4 decimal places.",
    category: "Stat",
    difficulty: "Hard",
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      {
        id: "tc-23",
        filename: "input_1.txt",
        inputContent: "5\n1 2\n2 4\n3 5\n4 4\n5 5",
        outputContent: "2.2000 0.6000",
        isPublic: true,
      },
      {
        id: "tc-24",
        filename: "input_2.txt",
        inputContent: "3\n1 1\n2 2\n3 3",
        outputContent: "0.0000 1.0000",
        isPublic: true,
      },
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

export async function updateProblem(id: string, data: Partial<Omit<Problem, "id" | "createdAt">>): Promise<Problem | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const index = problems.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const updatedProblem = {
    ...problems[index],
    ...data,
    updatedAt: new Date(),
  };

  problems[index] = updatedProblem;
  return updatedProblem;
}
