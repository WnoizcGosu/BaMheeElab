import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { FileCode2, BarChart3, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const dbProblems = await prisma.problem.findMany();
  
  // Use native category from database
  const problems = dbProblems;

  const programmingCount = problems.filter(
  (p: { category?: string | null }) => p.category === "Programming" || p.category === "General" || !p.category
  ).length;

  const statCount = problems.filter(
  (p: { category?: string | null }) => p.category === "Stat" || p.category === "Statistical Programming"
  ).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>
        Dashboard
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
        Welcome back, Admin. Manage problems and test cases from here.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Total Problems</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-orange)" }}>
            {problems.length}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Programming</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{programmingCount}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Statistical</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{statCount}</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
        Quick Actions
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link
          href="/admin/problems/create"
          className="flex items-center gap-2"
          style={{
            padding: "12px 20px",
            background: "linear-gradient(135deg, #E8652B, #D4541E)",
            color: "white",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Plus size={18} />
          Create Problem
        </Link>
        <Link
          href="/admin/problems?category=Programming"
          className="flex items-center gap-2"
          style={{
            padding: "12px 20px",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <FileCode2 size={18} />
          Programming Problems
        </Link>
        <Link
          href="/admin/problems?category=Stat"
          className="flex items-center gap-2"
          style={{
            padding: "12px 20px",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <BarChart3 size={18} />
          Stat Problems
        </Link>
      </div>
    </div>
  );
}
