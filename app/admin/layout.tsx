"use client";

import Link from "next/link";
import { LayoutDashboard, FileCode2, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-52px)]" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-light)",
          flexShrink: 0,
          boxShadow: "2px 0 8px rgba(139, 90, 43, 0.04)",
        }}
      >
        <div style={{ padding: "20px 16px 12px" }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              padding: "0 12px",
            }}
          >
            Admin Panel
          </h2>
        </div>
        <nav style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <Link
            href="/admin"
            className="flex items-center gap-3"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "var(--bg-card-alt)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/problems?category=Programming"
            className="flex items-center gap-3"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, rgba(232,101,43,0.08), rgba(232,101,43,0.04))",
              color: "var(--accent-orange)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(232,101,43,0.15)",
            }}
          >
            <FileCode2 size={18} />
            <span>Problems</span>
          </Link>
          <Link
            href="/admin/problems?category=Stat"
            className="flex items-center gap-3"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "var(--bg-card-alt)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <BarChart3 size={18} />
            <span>Stat Problems</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
