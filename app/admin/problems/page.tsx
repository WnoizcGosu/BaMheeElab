import prisma from "@/lib/db/prisma";
import ProblemsClient from "./problems-client";

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  
  // Fetch real problems from the database, including related test cases
  const dbProblems = await prisma.problem.findMany({
    include: { test_cases: true },
    orderBy: { created_at: 'desc' }
  });

  let problems = dbProblems.map((p: typeof dbProblems[number]) => {
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      difficulty: p.difficulty as "Easy" | "Medium" | "Hard" | "God",
      timeLimit: p.time_limit,
      memoryLimit: p.memory_limit,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      testCases: p.test_cases.map((tc: typeof p.test_cases[number]) => ({ id: tc.id, filename: tc.filename }))
    };
  });

  if (category) {
<<<<<<< HEAD
    problems = problems.filter((p: typeof problems[number]) => p.category === category);
  } else {
    // Default: show Programming and General problems
    problems = problems.filter((p: typeof problems[number]) =>
=======
    problems = problems.filter((p) => p.category === category);
  } else {
    problems = problems.filter((p) =>
>>>>>>> 5d0ca09f39d028567f8a878f4b1b542705bc56bd
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

<<<<<<< HEAD
  // Serialize dates for client component
  const serializedProblems = problems.map((p: typeof problems[number]) => ({
=======
  const serializedProblems = problems.map((p) => ({
>>>>>>> 5d0ca09f39d028567f8a878f4b1b542705bc56bd
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <ProblemsClient problems={serializedProblems} category={category} />;
}
