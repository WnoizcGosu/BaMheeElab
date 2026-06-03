"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteProblemButton({ problemId }: { problemId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this problem? This action cannot be undone and will delete all associated test cases and submissions.")) {
      try {
        const res = await fetch(`/api/admin/problems/${problemId}`, { method: 'DELETE' });
        if (res.ok) {
          router.push("/admin/problems");
          router.refresh();
        } else {
          alert("Failed to delete problem.");
        }
      } catch (e) {
        console.error(e);
        alert("Failed to delete problem.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-red-200"
    >
      <Trash2 size={18} /> Delete Problem
    </button>
  );
}
