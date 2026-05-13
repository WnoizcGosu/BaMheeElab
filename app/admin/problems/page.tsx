import { getProblems } from "@/lib/db/mock-problems";
import ProblemsClient from "./problems-client";

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  let problems = await getProblems();

  if (category) {
    problems = problems.filter((p) => p.category === category);
  } else {
    // Default: show Programming and General problems
    problems = problems.filter((p) =>
      p.category === "Programming" ||
      p.category === "General" ||
      !p.category
    );
  }

  // Serialize dates for client component
  const serializedProblems = problems.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <ProblemsClient problems={serializedProblems} category={category} />;
}
