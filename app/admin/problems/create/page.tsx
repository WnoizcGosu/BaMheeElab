"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, X, Loader2 } from "lucide-react";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCases, setTestCases] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    timeLimit: 1000,
    memoryLimit: 256,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTestCases((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingFiles(true);

    try {
      const uploadedCases = [];

      // Upload test cases to S3/MinIO via Next.js API
      for (const file of testCases) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);

        const uploadRes = await fetch("/api/admin/testcases/upload", {
          method: "POST",
          body: fileFormData,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedCases.push({
            id: data.s3Key || Math.random().toString(),
            filename: data.filename || file.name,
            inputUrl: data.fileUrl,
          });
        } else {
          console.error("Failed to upload", file.name);
        }
      }

      setUploadingFiles(false);

      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-orange)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-orange)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-orange)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-orange)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Test Cases Upload */}
          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 24, paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
              Test Cases
            </h3>
            
            <div
              style={{
                border: "2px dashed var(--border-medium)",
                borderRadius: "var(--radius-md)",
                padding: 28,
                textAlign: "center",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-orange)";
                e.currentTarget.style.background = "rgba(232, 101, 43, 0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-medium)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <input
                type="file"
                multiple
                id="testcases"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label htmlFor="testcases" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud style={{ color: "var(--text-light)" }} size={32} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-orange)" }}>
                  Click to upload files
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  .txt, .zip up to 10MB
                </span>
              </label>
            </div>

            {testCases.length > 0 && (
              <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, listStyle: "none", padding: 0 }}>
                {testCases.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between"
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-card-alt)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <File size={16} style={{ color: "var(--text-light)" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{
                        padding: 4,
                        border: "none",
                        background: "transparent",
                        color: "var(--text-light)",
                        cursor: "pointer",
                        borderRadius: 4,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--accent-red)";
                        e.currentTarget.style.background = "rgba(231, 76, 60, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-light)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit buttons */}
          <div
            className="flex justify-end gap-3"
            style={{
              borderTop: "1px solid var(--border-light)",
              marginTop: 24,
              paddingTop: 24,
            }}
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
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-card-alt)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
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
                boxShadow: "0 4px 12px rgba(232, 101, 43, 0.3)",
                transition: "all 0.2s",
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
