"use client";

import { useEffect, useState } from "react";
import { UploadCloud, File, X } from "lucide-react";
import {
  TestCasePair,
  pairTestCaseFiles,
  readFileAsText,
} from "@/lib/testcases";

interface PreviewData {
  input?: string;
  output?: string;
}

interface TestCaseUploaderProps {
  pairs: TestCasePair[];
  onPairsChange: (pairs: TestCasePair[]) => void;
  compact?: boolean;
}

export default function TestCaseUploader({
  pairs,
  onPairsChange,
  compact = false,
}: TestCaseUploaderProps) {
  const [previews, setPreviews] = useState<Record<string, PreviewData>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadPreviews() {
      const next: Record<string, PreviewData> = {};

      for (const pair of pairs) {
        const data: PreviewData = {};
        if (pair.inputFile) {
          try {
            data.input = await readFileAsText(pair.inputFile);
          } catch {
            data.input = "[Unable to read input file]";
          }
        }
        if (pair.outputFile) {
          try {
            data.output = await readFileAsText(pair.outputFile);
          } catch {
            data.output = "[Unable to read output file]";
          }
        }
        next[pair.id] = data;
      }

      if (!cancelled) setPreviews(next);
    }

    loadPreviews();
    return () => {
      cancelled = true;
    };
  }, [pairs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const incoming = Array.from(e.target.files);
    const allFiles: File[] = [];

    for (const pair of pairs) {
      if (pair.inputFile) allFiles.push(pair.inputFile);
      if (pair.outputFile) allFiles.push(pair.outputFile);
    }
    allFiles.push(...incoming);

    onPairsChange(pairTestCaseFiles(allFiles));
    e.target.value = "";
  };

  const removePair = (id: string) => {
    onPairsChange(pairs.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div
        style={{
          border: "2px dashed var(--border-medium)",
          borderRadius: "var(--radius-md)",
          padding: compact ? 20 : 28,
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
          id="testcase-files"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".txt,.in,.out,.input,.output,.ans"
        />
        <label htmlFor="testcase-files" className="cursor-pointer flex flex-col items-center gap-2">
          <UploadCloud style={{ color: "var(--text-light)" }} size={compact ? 28 : 32} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-orange)" }}>
            Click to upload test case files
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Pair input/output by name (e.g. sample1.in + sample1.out, input_1.txt + output_1.txt)
          </span>
        </label>
      </div>

      {pairs.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {pairs.map((pair, idx) => {
            const preview = previews[pair.id];
            return (
              <div
                key={pair.id}
                style={{
                  padding: 14,
                  background: "var(--bg-card-alt)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    Test Case #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePair(pair.id)}
                    style={{
                      padding: 4,
                      border: "none",
                      background: "transparent",
                      color: "var(--text-light)",
                      cursor: "pointer",
                    }}
                    aria-label="Remove test case"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-2" style={{ marginBottom: 10 }}>
                  {pair.inputFile && (
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      <File size={14} />
                      <span>Input: {pair.inputFile.name}</span>
                    </div>
                  )}
                  {pair.outputFile && (
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      <File size={14} />
                      <span>Output: {pair.outputFile.name}</span>
                    </div>
                  )}
                  {!pair.inputFile && !pair.outputFile && (
                    <span style={{ fontSize: 12, color: "var(--accent-red)" }}>No files attached</span>
                  )}
                  {pair.inputFile && !pair.outputFile && (
                    <span style={{ fontSize: 11, color: "var(--accent-red)" }}>
                      Missing output file — upload a matching .out / output file
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      INPUT PREVIEW
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        fontFamily: "monospace",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 6,
                        maxHeight: 120,
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        color: "var(--text-primary)",
                      }}
                    >
                      {preview?.input ?? (pair.inputFile ? "Loading..." : "—")}
                    </pre>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                      OUTPUT PREVIEW
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        fontFamily: "monospace",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 6,
                        maxHeight: 120,
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        color: "var(--text-primary)",
                      }}
                    >
                      {preview?.output ?? (pair.outputFile ? "Loading..." : "—")}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
