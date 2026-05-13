"use client";

import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";

interface SerializedProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
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
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          {category === "Stat" ? "Statistical Programming Problems" : "Programming Problems"}
        </h1>
        <Link
          href="/admin/problems/create"
          className="flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #E8652B, #D4541E)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(232, 101, 43, 0.3)",
            transition: "all 0.2s",
          }}
        >
          <Plus size={18} />
          Create Problem
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* Search bar */}
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-card-alt)",
          }}
        >
          <div className="relative" style={{ maxWidth: 380 }}>
            <Search
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-light)",
              }}
              size={18}
            />
            <input
              type="text"
              placeholder="Search problems..."
              style={{
                width: "100%",
                padding: "10px 16px 10px 40px",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
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

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--bg-card-alt)",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>ID</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Title</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Category</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Difficulty</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Limits</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Test Cases</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No problems found. Create one to get started.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr
                    key={problem.id}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                      transition: "background 0.15s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card-alt)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "var(--text-muted)" }}>
                      {problem.id}
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-primary)" }}>
                      <Link
                        href={`/admin/problems/${problem.id}`}
                        style={{
                          color: "var(--accent-orange)",
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                        className="hover:underline"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)" }}>
                      {problem.category || "General"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        className={`badge ${
                          problem.difficulty === "Easy"
                            ? "badge-easy"
                            : problem.difficulty === "Medium"
                            ? "badge-medium"
                            : "badge-hard"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-secondary)" }}>
                      {problem.timeLimit}ms / {problem.memoryLimit}MB
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        className="flex items-center gap-1.5"
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        <FileText size={15} style={{ color: "var(--text-light)" }} />
                        {problem.testCases?.length || 0}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={`/admin/problems/${problem.id}`}
                        style={{
                          color: "var(--accent-orange)",
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                        className="hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
