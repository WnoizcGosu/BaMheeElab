import prisma from "@/lib/db/prisma";
import ProblemsClient from "./problems-client";

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  
  // Fetch real problems from the database, including related test cases
  const dbProblems = await prisma.problem.findMany({
    include: { test_cases: true },
    orderBy: { created_at: 'desc' }
  });

  // Since category and difficulty are packed in the description in our workaround,
  // we can parse them for display. (e.g. "**Category:** Programming | **Difficulty:** Easy\n\n...")
  let problems = dbProblems.map((p) => {
    let extractedCategory = "Programming";
    let extractedDifficulty = "Easy";
    
    const catMatch = p.description.match(/\*\*Category:\*\*\s*(.*?)\s*\|/);
    if (catMatch) extractedCategory = catMatch[1].trim();

    const diffMatch = p.description.match(/\*\*Difficulty:\*\*\s*(.*?)\n/);
    if (diffMatch) extractedDifficulty = diffMatch[1].trim();

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: extractedCategory,
      difficulty: extractedDifficulty as "Easy" | "Medium" | "Hard" | "God",
      timeLimit: p.time_limit,
      memoryLimit: p.memory_limit,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      testCases: p.test_cases.map(tc => ({ id: tc.id, filename: tc.filename }))
    };
  });

  if (category) {
    problems = problems.filter((p) => p.category === category);
  } else {
    // Default: show Programming and General problems
    problems = problems.filter((p) =>
      p.category === "Programming" ||
      p.category === "General" ||
      p.category === "Statistical Programming" ||
      !p.category
    );
  }

  const difficultyOrder: Record<string, number> = { "Easy": 1, "Medium": 2, "Hard": 3, "God": 4 };
  problems.sort((a, b) => {
    return (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
  });

  // Serialize dates for client component
  const serializedProblems = problems.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <ProblemsClient problems={serializedProblems} category={category} />;
}
