import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { CheckCircle2, XCircle, Clock, MemoryStick as Memory, Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SubmissionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbSub = await prisma.submission.findUnique({
    where: { id },
    include: {
      problem: true,
      test_case_results: {
        include: {
          test_case: true
        }
      }
    }
  });

  if (!dbSub) {
    notFound();
  }

  const problem = dbSub.problem;
  
  const submission = {
    problemId: dbSub.problem_id,
    language: dbSub.language,
    status: dbSub.status === 'ACCEPTED' ? 'Passed' : 
            dbSub.status === 'WRONG_ANSWER' ? 'Failed' : 
            dbSub.status === 'TIME_LIMIT' ? 'Time Limit Exceeded' :
            dbSub.status === 'RUNTIME_ERROR' ? 'Runtime Error' :
            dbSub.status === 'COMPILE_ERROR' ? 'Compilation Error' : 'Pending',
    createdAt: dbSub.submitted_at,
    executionTime: dbSub.runtime || 0,
    memoryUsed: dbSub.memory || 0,
    code: dbSub.source_code,
    testCaseResults: dbSub.test_case_results.map((tc: typeof dbSub.test_case_results[number]) => ({
      testCaseId: tc.test_case_id,
      status: tc.passed ? 'Passed' : 'Failed',
      executionTime: tc.runtime || 0,
      memoryUsed: tc.memory || 0,
      input: tc.test_case.input_content || `[File at ${tc.test_case.input_url}]`,
      expectedOutput: tc.test_case.output_content || `[File at ${tc.test_case.output_url}]`,
      actualOutput: tc.actual_output || ""
    }))
  };

  const isPassed = submission.status === "Passed";
  const passedCount = submission.testCaseResults.filter((tc) => tc.status === "Passed").length;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
      <Link
        href="/submissions"
        className="flex items-center gap-2"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          textDecoration: "none",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} />
        All Submissions
      </Link>

      {/* Overall status */}
      <div
        className="card"
        style={{
          padding: 24,
          marginBottom: 20,
          border: isPassed
            ? "1px solid rgba(76, 175, 80, 0.4)"
            : "1px solid rgba(231, 76, 60, 0.4)",
          background: isPassed ? "rgba(76, 175, 80, 0.08)" : "rgba(231, 76, 60, 0.08)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {isPassed ? (
              <CheckCircle2 size={40} style={{ color: "var(--accent-green)" }} />
            ) : (
              <XCircle size={40} style={{ color: "var(--accent-red)" }} />
            )}
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  margin: 0,
                  color: isPassed ? "var(--easy-text)" : "var(--hard-text)",
                }}
              >
                {submission.status.toUpperCase()}
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
                {problem?.title ?? `Problem #${submission.problemId}`} · {submission.language} ·{" "}
                {submission.createdAt.toLocaleString()}
              </p>
            </div>
          </div>
          <Link
            href={`/admin/problems/${submission.problemId}`}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
            }}
          >
            View Problem
          </Link>
        </div>

        <div className="flex flex-wrap gap-4" style={{ marginTop: 20 }}>
          <div
            className="flex items-center gap-2"
            style={{
              padding: "8px 14px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Clock size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{submission.executionTime} ms</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              padding: "8px 14px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Memory size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{submission.memoryUsed} MB</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              padding: "8px 14px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Code2 size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {passedCount} / {submission.testCaseResults.length} test cases passed
            </span>
          </div>
        </div>
      </div>

      {/* Test cases */}
      <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-card-alt)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Test Cases
          </h2>
        </div>

        <div>
          {submission.testCaseResults.map((tc: typeof submission.testCaseResults[number], index: number) => {
            const tcPassed = tc.status === "Passed";
            return (
              <div
                key={tc.testCaseId}
                style={{
                  padding: 20,
                  borderBottom: "1px solid var(--border-light)",
                  background: tcPassed ? "transparent" : "rgba(231, 76, 60, 0.04)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <div className="flex items-center gap-2">
                    {tcPassed ? (
                      <CheckCircle2 size={20} style={{ color: "var(--accent-green)" }} />
                    ) : (
                      <XCircle size={20} style={{ color: "var(--accent-red)" }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      Test Case {index + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: tcPassed ? "var(--easy-bg)" : "var(--hard-bg)",
                        color: tcPassed ? "var(--easy-text)" : "var(--hard-text)",
                      }}
                    >
                      {tc.status.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {tc.executionTime} ms · {tc.memoryUsed} MB
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Input
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 12,
                        fontSize: 12,
                        fontFamily: "monospace",
                        background: "var(--bg-card-alt)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Expected Output
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 12,
                        fontSize: 12,
                        fontFamily: "monospace",
                        background: "var(--bg-card-alt)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {tc.expectedOutput}
                    </pre>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: tcPassed ? "var(--easy-text)" : "var(--hard-text)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Actual Output
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 12,
                        fontSize: 12,
                        fontFamily: "monospace",
                        background: tcPassed ? "var(--easy-bg)" : "var(--hard-bg)",
                        border: `1px solid ${tcPassed ? "rgba(76,175,80,0.3)" : "rgba(231,76,60,0.35)"}`,
                        borderRadius: 6,
                        whiteSpace: "pre-wrap",
                        color: tcPassed ? "var(--easy-text)" : "var(--hard-text)",
                        fontWeight: tcPassed ? 400 : 600,
                      }}
                    >
                      {tc.actualOutput}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-light)",
            background: "var(--bg-card-alt)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Submitted Code
          </h2>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 20,
            fontSize: 13,
            fontFamily: "monospace",
            color: "var(--text-primary)",
            background: "var(--bg-card-alt)",
            overflowX: "auto",
          }}
        >
          <code>{submission.code}</code>
        </pre>
      </div>
    </div>
  );
}
