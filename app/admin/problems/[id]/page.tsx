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
    // 🎯 แก้ไขจุดนี้: ใส่ Type ให้ตัวแปร tc โดยดึงจากอาเรย์ในตัวแปร p ตรงๆ
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Problem Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-mono text-gray-500 mb-1">ID: {problem.id}</div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
                  {formatDifficultyLabel(problem.difficulty)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <DeleteProblemButton problemId={problem.id} />
              <Link
                href={`/admin/problems/${problem.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                Edit Problem
              </Link>
            </div>
          </div>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Clock size={16} />
              <span className="text-sm font-medium">{problem.timeLimit} ms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Memory size={16} />
              <span className="text-sm font-medium">{problem.memoryLimit} MB</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <FileText size={16} />
              <span className="text-sm font-medium">{problem.testCases?.length || 0} Test Cases</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {problem.description || "No description provided."}
          </div>
        </div>

        <ProblemTestCasesSection problemId={problem.id} testCases={problem.testCases ?? []} />
      </div>
    </div>
  );
}