import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default async function SubmissionsIndexPage() {
  const dbSubmissions = await prisma.submission.findMany({
    include: {
      test_case_results: true,
      problem: true,
    },
    orderBy: { submitted_at: 'desc' }
  });

  const submissions = dbSubmissions.map((sub: typeof dbSubmissions[number]) => ({
    id: sub.id,
    problemId: sub.problem_id,
    problemTitle: sub.problem.title,
    language: sub.language,
    status: sub.status === 'ACCEPTED' ? 'Passed' : 
            sub.status === 'WRONG_ANSWER' ? 'Failed' : 
            sub.status === 'TIME_LIMIT' ? 'Time Limit Exceeded' :
            sub.status === 'RUNTIME_ERROR' ? 'Runtime Error' :
            sub.status === 'COMPILE_ERROR' ? 'Compilation Error' : 'Pending',
    executionTime: sub.runtime || 0,
    memoryUsed: sub.memory || 0,
    testCaseResults: sub.test_case_results.map((tc: typeof sub.test_case_results[number]) => ({
      status: tc.passed ? 'Passed' : 'Failed'
    }))
  }));

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        Submission Results (Demo)
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
        เปิดดู UI ผลการส่งโค้ด — ทั้งผ่านและไม่ผ่าน
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {submissions.map((sub: typeof dbSubmissions[number]) => {
          const passed = sub.status === "Passed";
          const passedCount = sub.testCaseResults.filter((tc: typeof sub.test_case_results[number]) => tc.status === "Passed").length;
          const total = sub.testCaseResults.length;

          return (
            <Link
              key={sub.id}
              href={`/submissions/${sub.id}`}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                textDecoration: "none",
                border: passed
                  ? "1px solid rgba(76, 175, 80, 0.35)"
                  : "1px solid rgba(231, 76, 60, 0.35)",
                background: passed ? "rgba(76, 175, 80, 0.06)" : "rgba(231, 76, 60, 0.06)",
                transition: "box-shadow 0.2s, transform 0.15s",
              }}
            >
              <div className="flex items-center gap-4">
                {passed ? (
                  <CheckCircle2 size={32} style={{ color: "var(--accent-green)" }} />
                ) : (
                  <XCircle size={32} style={{ color: "var(--accent-red)" }} />
                )}
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: passed ? "var(--easy-text)" : "var(--hard-text)",
                    }}
                  >
                    {sub.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    Problem #{sub.problemId} · {sub.language} · {passedCount}/{total} test cases
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {sub.executionTime} ms · {sub.memoryUsed} MB
                  </div>
                </div>
              </div>
              <ArrowRight size={20} style={{ color: "var(--text-light)" }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
