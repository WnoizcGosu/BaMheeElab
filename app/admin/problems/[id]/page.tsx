import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { normalizeDifficulty, formatDifficultyLabel } from "@/lib/testcases";
import { ArrowLeft, Clock, MemoryStick as Memory, FileText } from "lucide-react";
import ProblemTestCasesSection from "@/components/admin/problem-test-cases-section";
import DeleteProblemButton from "./delete-button";

export default async function ProblemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.problem.findUnique({
    where: { id },
    include: { test_cases: true }
  });

  if (!p) {
    notFound();
  }

  const extractedCategory = p.category;
  const extractedDifficulty = p.difficulty;

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
    testCases: p.test_cases.map((tc: typeof p.test_cases[number]) => ({
      id: tc.id,
      filename: tc.filename,
      inputUrl: tc.input_url || undefined,
      outputUrl: tc.output_url || undefined,
      inputContent: tc.input_content || undefined,
      outputContent: tc.output_content || undefined,
      isPublic: tc.is_public
    }))
  };

  const difficulty = normalizeDifficulty(problem.difficulty);
  const badgeClass =
    difficulty === "Easy"
      ? "bg-green-100 text-green-700"
      : difficulty === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : difficulty === "Hard"
          ? "bg-red-100 text-red-700"
          : "bg-purple-100 text-purple-700";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/problems"
          className="p-2 hover:bg-red-50 hover:text-brand-red rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Problem Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="p-6 border-b border-red-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-mono text-gray-500 mb-1">ID: {problem.id}</div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
                <span className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-full ${badgeClass}`}>
                  {formatDifficultyLabel(problem.difficulty)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <DeleteProblemButton problemId={problem.id} />
              <Link
                href={`/admin/problems/${problem.id}/edit`}
                className="bg-brand-red hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm"
              >
                Edit Problem
              </Link>
            </div>
          </div>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-700 bg-red-50/50 px-3 py-1.5 rounded-md border border-red-100">
              <Clock size={16} className="text-brand-orange" />
              <span className="text-sm font-semibold">{problem.timeLimit} ms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-red-50/50 px-3 py-1.5 rounded-md border border-red-100">
              <Memory size={16} className="text-brand-orange" />
              <span className="text-sm font-semibold">{problem.memoryLimit} MB</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-red-50/50 px-3 py-1.5 rounded-md border border-red-100">
              <FileText size={16} className="text-brand-orange" />
              <span className="text-sm font-semibold">{problem.testCases?.length || 0} Test Cases</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {problem.description || "No description provided."}
          </div>
        </div>

        <ProblemTestCasesSection problemId={problem.id} testCases={problem.testCases ?? []} />
      </div>
    </div>
  );
}