"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TestCase } from "@/types/problem";
import { TestCasePair, buildTestCasesFromPairs } from "@/lib/testcases";
import TestCaseUploader from "./test-case-uploader";

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
  const [pairs, setPairs] = useState<TestCasePair[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (pairs.length === 0) {
      setError("Upload at least one input/output file pair.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newCases = await buildTestCasesFromPairs(pairs);

      const res = await fetch(`/api/admin/problems/${problemId}/testcases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCases: newCases }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add test cases");
      }

      setPairs([]);
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
        + Add Test Case
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
          <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Add Test Cases</h4>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setPairs([]);
              setError(null);
            }}
            style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      )}

      {existingTestCases.length > 0 && variant === "inline" && (
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", marginBottom: 12 }}>
          {existingTestCases.length} existing test case(s). New uploads will be appended.
        </p>
      )}

      <TestCaseUploader pairs={pairs} onPairsChange={setPairs} compact />

      {error && (
        <p style={{ fontSize: 13, color: "var(--accent-red, #e74c3c)", marginTop: 10 }}>{error}</p>
      )}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {variant === "modal" && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setPairs([]);
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
          disabled={isSubmitting || pairs.length === 0}
          className="flex items-center gap-2"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            background: isSubmitting ? "#93c5fd" : "#2563eb",
            border: "none",
            borderRadius: 6,
            cursor: isSubmitting || pairs.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Uploading...
            </>
          ) : (
            "Add Test Case(s)"
          )}
        </button>
      </div>
    </div>
  );
}
