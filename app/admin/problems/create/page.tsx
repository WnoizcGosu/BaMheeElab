"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TestCasePair, buildTestCasesFromPairs } from "@/lib/testcases";
import TestCaseUploader from "@/components/admin/test-case-uploader";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pairs, setPairs] = useState<TestCasePair[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard" | "God",
    timeLimit: 1000,
    memoryLimit: 256,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingFiles(true);

    try {
      const uploadedCases = pairs.length > 0 ? await buildTestCasesFromPairs(pairs) : [];
      setUploadingFiles(false);

      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          testCases: uploadedCases,
        }),
      });

      if (res.ok) {
        router.push("/admin/problems");
        router.refresh();
      } else {
        console.error("Failed to save problem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--accent-orange)";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--border-light)";
      e.currentTarget.style.boxShadow = "none";
    },
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 20px" }}>
        Create New Problem
      </h1>

      <div className="card" style={{ overflow: "hidden" }}>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={inputStyle}
                placeholder="e.g. A+B Problem"
                {...focusHandlers}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Describe the problem..."
                {...focusHandlers}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Programming">Programming</option>
                  <option value="Stat">Statistical Programming</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "Easy" | "Medium" | "Hard" | "God",
                    })
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                  <option value="God">GOD</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Time Limit (ms)</label>
                <input
                  required
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
              <div>
                <label style={labelStyle}>Memory Limit (MB)</label>
                <input
                  required
                  type="number"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 24, paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
              Test Cases
            </h3>
            <TestCaseUploader pairs={pairs} onPairsChange={setPairs} />
          </div>

          <div
            className="flex justify-end gap-3"
            style={{ borderTop: "1px solid var(--border-light)", marginTop: 24, paddingTop: 24 }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
              style={{
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #E8652B, #D4541E)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  {uploadingFiles ? "Uploading Files..." : "Saving..."}
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
