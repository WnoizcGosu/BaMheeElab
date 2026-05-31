"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Trash2 } from "lucide-react";
import { normalizeDifficulty, formatDifficultyLabel } from "@/lib/testcases";

interface SerializedProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "God";
  timeLimit: number;
  memoryLimit: number;
  testCases: { id: string; filename: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function ProblemsClient({
  problems,
  category,
}: {
  problems: SerializedProblem[];
  category?: string;
}) {
  const [query, setQuery] = useState("");

  const filteredProblems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return problems;

    return problems.filter((p) => {
      const difficulty = normalizeDifficulty(p.difficulty).toLowerCase();
      const category = (p.category || "").toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        category.includes(q) ||
        difficulty.includes(q)
      );
    });
  }, [problems, query]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900 m-0">
          {category === "Stat" ? "Statistical Programming Problems" : "Programming Problems"}
        </h1>
        <Link
          href="/admin/problems/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Problem
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-red-100 bg-red-50/30">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, ID, category, or difficulty..."
              className="w-full pl-10 pr-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-50/50 border-b border-red-100 text-brand-red">
                <th className="px-5 py-3.5 font-semibold text-sm">ID</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Title</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Category</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Difficulty</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Limits</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Test Cases</th>
                <th className="px-5 py-3.5 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500 font-medium"
                  >
                    {query.trim()
                      ? `No problems match "${query.trim()}".`
                      : "No problems found. Create one to get started."}
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => {
                  const difficulty = normalizeDifficulty(problem.difficulty);
                  return (
                  <tr
                    key={problem.id}
                    className="border-b border-gray-100 transition-colors hover:bg-red-50/30"
                  >
                    <td className="px-5 py-3.5 font-mono text-sm text-gray-500">
                      {problem.id}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      <Link
                        href={`/admin/problems/${problem.id}`}
                        className="text-brand-orange hover:underline transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">
                      {problem.category || "General"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`badge ${
                          difficulty === "Easy"
                            ? "badge-easy"
                            : difficulty === "Medium"
                              ? "badge-medium"
                              : difficulty === "Hard"
                                ? "badge-hard"
                                : "badge-god"
                        }`}
                      >
                        {formatDifficultyLabel(problem.difficulty)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">
                      {problem.timeLimit}ms / {problem.memoryLimit}MB
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                        <FileText size={15} className="text-gray-400" />
                        {problem.testCases?.length || 0}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/problems/${problem.id}`}
                          className="text-brand-orange text-sm font-semibold hover:underline"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this problem? This action cannot be undone and will delete all associated test cases and submissions.")) {
                              try {
                                const res = await fetch(`/api/admin/problems/${problem.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  window.location.reload();
                                } else {
                                  alert("Failed to delete problem.");
                                }
                              } catch (e) {
                                console.error(e);
                                alert("Failed to delete problem.");
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
