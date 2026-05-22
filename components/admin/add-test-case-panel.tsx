"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { TestCase } from "@/types/problem";
import { v4 as uuidv4 } from "uuid";

interface AddTestCasePanelProps {
  problemId: string;
  existingTestCases?: TestCase[];
  variant?: "inline" | "modal";
  onSuccess?: () => void;
}

export default function AddTestCasePanel({
  problemId,
  existingTestCases = [],
  variant = "inline",
  onSuccess,
}: AddTestCasePanelProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(variant === "inline");
  const [testCases, setTestCases] = useState<{ id: string; inputContent: string; outputContent: string; isPublic: boolean }[]>(
    existingTestCases.length > 0 
      ? existingTestCases.map(tc => ({
          id: tc.id,
          inputContent: tc.inputContent || "",
          outputContent: tc.outputContent || "",
          isPublic: tc.isPublic || false
        }))
      : [{ id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAdd = async () => {
    // Validate inputs to prevent basic injection/empty string issues
    const validTestCases = testCases.filter(tc => tc.inputContent.trim() !== "" && tc.outputContent.trim() !== "");
    if (validTestCases.length === 0) {
      setError("Provide valid Input and Output pairs. Empty pairs are not allowed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newCases: TestCase[] = validTestCases.map((tc, index) => {
        const existing = existingTestCases.find(e => e.id === tc.id);
        return {
          id: tc.id,
          filename: existing?.filename || `testcase_${Date.now()}_${index}.txt`,
          inputContent: tc.inputContent,
          outputContent: tc.outputContent,
          isPublic: tc.isPublic
        };
      });

      // Update the entire problem's test cases list using the PUT endpoint
      const res = await fetch(`/api/admin/problems/${problemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCases: newCases }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update test cases");
      }

      setExpanded(variant === "inline");
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add test cases");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "modal" && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Manage Test Cases
      </button>
    );
  }

  return (
    <div
      style={
        variant === "modal"
          ? {
              marginTop: 16,
              padding: 16,
              background: "white",
              borderRadius: 8,
              border: "1px solid var(--border-light, #e5e7eb)",
            }
          : undefined
      }
    >
      {variant === "modal" && (
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Manage Test Cases (Direct Input)</h4>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setTestCases([{ id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }]);
              setError(null);
            }}
            style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      )}



      <div className="flex flex-col gap-4">
        {testCases.map((tc, idx) => (
          <div key={tc.id} className="p-4 border border-gray-200 rounded-md bg-gray-50 relative">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm">Test Case #{idx + 1}</span>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={tc.isPublic}
                      onChange={(e) => handleUpdateTestCaseField(tc.id, "isPublic", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-600 font-medium">แสดงเป็นตัวอย่างในโจทย์ (Public)</span>
                  </label>
                </div>
                {testCases.length > 1 && (
                  <button 
                    onClick={() => handleRemoveTestCaseField(tc.id)} 
                    className="text-red-500 hover:text-red-700"
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
                   className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                   rows={4}
                   value={tc.inputContent}
                   onChange={(e) => handleUpdateTestCaseField(tc.id, "inputContent", e.target.value)}
                   placeholder="Enter input string..."
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Output</label>
                 <textarea 
                   className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
           onClick={handleAddTestCaseField}
           className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 self-start"
        >
          <Plus size={16} /> Add Another Test Case Field
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "var(--accent-red, #e74c3c)", marginTop: 10 }}>{error}</p>
      )}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {variant === "modal" && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setTestCases([{ id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }]);
              setError(null);
            }}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSubmitting}
          className="flex items-center gap-2"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            background: isSubmitting ? "#93c5fd" : "#2563eb",
            border: "none",
            borderRadius: 6,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Test Cases"
          )}
        </button>
      </div>
    </div>
  );
}
