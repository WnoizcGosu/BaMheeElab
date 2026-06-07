"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard" | "God";
    time_limit: number;
    memory_limit: number;
  }>({
    title: "",
    description: "",
    category: "Programming",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard" | "God",
    time_limit: 1000,
    memory_limit: 256,
  });

  const [testCases, setTestCases] = useState<{ id: string; inputContent: string; outputContent: string; isPublic: boolean }[]>([
    { id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }
  ]);

  const handleAddTestCaseField = () => {
    setTestCases([...testCases, { id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }]);
  };

  const handleRemoveTestCaseField = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const handleUpdateTestCaseField = (id: string, field: "inputContent" | "outputContent" | "isPublic", value: string | boolean) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validTestCases = testCases.filter(
        tc => tc.inputContent.trim() !== "" && tc.outputContent.trim() !== ""
      );

      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,

          // 📊 แมปฟิลด์ข้อจำกัดเวลาและความจำให้ตรงโมเดล Problem
          time_limit: formData.time_limit,
          timeLimit: formData.time_limit,
          memory_limit: formData.memory_limit,
          memoryLimit: formData.memory_limit,
          testCases: validTestCases.map((tc, index) => ({
            order_index: index,
            is_public: tc.isPublic,
            input_content: tc.inputContent,
            output_content: tc.outputContent,
            isPublic: tc.isPublic,
            inputContent: tc.inputContent,
            outputContent: tc.outputContent,
          })),
        }),
      });

      if (res.ok) {
        router.push("/admin/problems");
        router.refresh();
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.error("Failed to save problem", res.status, errBody);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Create New Problem
      </h1>

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
                placeholder="e.g. A+B Problem"
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
                placeholder="Describe the problem..."
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
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Memory Limit (MB)</label>
                <input
                  required
                  type="number"
                  value={formData.memory_limit}
                  onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-red-100 rounded-lg bg-white text-gray-900 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-red-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Test Cases
            </h3>

            <div className="flex flex-col gap-4">
              {testCases.map((tc, idx) => (
                <div key={tc.id} className="p-4 border border-red-100 rounded-lg bg-red-50/30 relative">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm text-brand-red">Test Case #{idx + 1}</span>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={tc.isPublic}
                          onChange={(e) => handleUpdateTestCaseField(tc.id, "isPublic", e.target.checked)}
                          className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-gray-700 font-medium">แสดงเป็นตัวอย่างในโจทย์ (Public)</span>
                      </label>
                    </div>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCaseField(tc.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove Test Case"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Input Data</label>
                      <textarea
                        className="w-full border border-red-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red font-mono bg-white"
                        rows={4}
                        value={tc.inputContent}
                        onChange={(e) => handleUpdateTestCaseField(tc.id, "inputContent", e.target.value)}
                        placeholder="Enter input string..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Output</label>
                      <textarea
                        className="w-full border border-red-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red font-mono bg-white"
                        rows={4}
                        value={tc.outputContent}
                        onChange={(e) => handleUpdateTestCaseField(tc.id, "outputContent", e.target.value)}
                        placeholder="Enter expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddTestCaseField}
                className="flex items-center gap-1 text-sm font-semibold text-brand-orange hover:text-brand-red transition-colors self-start mt-2"
              >
                <Plus size={16} /> Add Another Test Case Field
              </button>
            </div>
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
                "Create Problem"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}