"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Problem } from "@/types/problem";
import AddTestCasePanel from "@/components/admin/add-test-case-panel";
import { normalizeDifficulty } from "@/lib/testcases";

export default function EditProblemForm({ problem }: { problem: Problem }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: problem.title,
    description: problem.description,
    category: problem.category && problem.category !== "General" ? problem.category : "Programming",
    difficulty: normalizeDifficulty(problem.difficulty),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/problems/${problem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/admin/problems/${problem.id}`);
        router.refresh();
      } else {
        console.error("Failed to update problem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Problem</h1>

      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all cursor-pointer"
                >
                  <option value="Programming">Programming</option>
                  <option value="Stat">Statistical Programming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "Easy" | "Medium" | "Hard" | "God",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all cursor-pointer"
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                  <option value="God">GOD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Limit (ms)</label>
                <input
                  required
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Memory Limit (MB)</label>
                <input
                  required
                  type="number"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-red-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Test Cases</h3>
            {problem.testCases.length > 0 && (
              <p className="text-sm text-gray-500 mb-4 font-medium">
                {problem.testCases.length} existing test case(s)
              </p>
            )}
            <AddTestCasePanel
              problemId={problem.id}
              existingTestCases={problem.testCases}
              variant="inline"
            />
          </div>

          <div className="border-t border-red-100 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-red-100 rounded-lg hover:bg-red-50/50 hover:border-red-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-red rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
