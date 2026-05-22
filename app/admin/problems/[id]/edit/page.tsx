import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import EditProblemForm from "./edit-form";

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.problem.findUnique({
    where: { id },
    include: { test_cases: true }
  });

  if (!p) {
    notFound();
  }

  let extractedCategory = p.category;
  let extractedDifficulty = p.difficulty;

  const problem = {
    id: p.id,
    title: p.title,
    description: p.description,
    category: extractedCategory,
    difficulty: extractedDifficulty as "Easy" | "Medium" | "Hard" | "God",
    timeLimit: p.time_limit,
    memoryLimit: p.memory_limit,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    testCases: p.test_cases.map(tc => ({
      id: tc.id,
      filename: tc.filename,
      inputUrl: tc.input_url || undefined,
      outputUrl: tc.output_url || undefined,
      inputContent: tc.input_content || undefined,
      outputContent: tc.output_content || undefined,
      isPublic: tc.is_public
    }))
  };

  return <EditProblemForm problem={problem} />;
}
