"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// ==========================================
// Mock Data
// ==========================================
const userData = {
  name: "Worachot K.",
  username: "worachot_dev",
  rank: "Noodle Novice",
  points: 840,
  nextRankPoints: 1200,
  nextRankName: "Chopstick Challenger",
  solved: 8,
  streak: 3,
  globalRank: 142,
};

const languageStats = [
  { name: "Python", solved: 5, total: 8, color: "#3776AB" },
  { name: "C", solved: 2, total: 8, color: "#555555" },
  { name: "C++", solved: 1, total: 8, color: "#7B42BC" },
];

const skills = [
  { name: "String", count: 5, color: "#E8652B" },
  { name: "Array", count: 5, color: "#E8652B" },
  { name: "Link list", count: 7, color: "#E8652B" },
  { name: "Matrix", count: 7, color: "#F0A830" },
  { name: "Math", count: 2, color: "#F0A830" },
  { name: "List", count: 2, color: "#F0A830" },
];

const recentSubmissions = [
  { title: "A + B Problems", time: "2h ago", difficulty: "Easy", lang: "Python", status: "accepted" },
  { title: "Two Sum", time: "1d ago", difficulty: "Easy", lang: "Python", status: "accepted" },
  { title: "Reverse Linked List", time: "2d ago", difficulty: "Medium", lang: "C++", status: "accepted" },
  { title: "Binary Search", time: "3d ago", difficulty: "Easy", lang: "C", status: "accepted" },
  { title: "Merge Sort", time: "5d ago", difficulty: "Medium", lang: "C", status: "accepted" },
];

const difficultyDist = {
  easy: { count: 5, total: 8, color: "#4CAF50" },
  medium: { count: 2, total: 8, color: "#F0A830" },
  hard: { count: 1, total: 8, color: "#E74C3C" },
};

// Generate heatmap data (12 weeks)
function generateHeatmap(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const rand = Math.random();
      if (rand < 0.3) week.push(0);
      else if (rand < 0.5) week.push(1);
      else if (rand < 0.7) week.push(2);
      else if (rand < 0.85) week.push(3);
      else week.push(4);
    }
    weeks.push(week);
  }
  return weeks;
}

function getHeatColor(level: number): string {
  const colors = ["#F0E0CF", "#F5C9A0", "#E89860", "#D4642A", "#A03D12"];
  return colors[level] || colors[0];
}

// ==========================================
// Sub-components
// ==========================================

function ProfileCard() {
  const progress = (userData.points / userData.nextRankPoints) * 100;

  return (
    <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
      {/* Header gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #E8652B 0%, #D4541E 50%, #C04415 100%)",
          padding: "24px 24px 20px",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F5A05C, #E8652B)",
              border: "3px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            W
          </div>
          <div>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 700, margin: 0 }}>
              {userData.name}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "2px 0 0" }}>
              {userData.username}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
                padding: "2px 8px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              🍜 {userData.rank}
            </div>
          </div>
        </div>

        {/* Progress to next rank */}
        <div style={{ marginTop: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 500 }}>
              Progress to {userData.nextRankName}
            </span>
            <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
              {userData.points} pts
            </span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #F5A05C, #F7C948)",
                borderRadius: 99,
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 }}>
            {Math.round(progress)}% to next rank
          </p>
        </div>
      </div>

      {/* Edit profile button */}
      <div style={{ padding: "16px 24px" }}>
        <button
          style={{
            width: "100%",
            padding: "10px 0",
            border: "1.5px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-alt)";
            e.currentTarget.style.borderColor = "var(--accent-orange)";
            e.currentTarget.style.color = "var(--accent-orange)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-medium)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit profile
        </button>
      </div>
    </div>
  );
}

function StatsCards() {
  const stats = [
    { label: "Solved", value: userData.solved.toString(), icon: "✅" },
    { label: "Streak", value: `${userData.streak}d`, icon: "🔥" },
    { label: "Rank", value: `#${userData.globalRank}`, icon: "🏆" },
  ];

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        animationDelay: "0.1s",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card"
          style={{
            padding: "16px 12px",
            textAlign: "center",
            cursor: "default",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
            {stat.value}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginTop: 2 }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function LanguagesCard() {
  return (
    <div className="card animate-fade-in-up" style={{ padding: 20, animationDelay: "0.15s" }}>
      <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
        <span style={{ fontSize: 16 }}>{"</>"}</span> Languages
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {languageStats.map((lang) => (
          <div key={lang.name} className="flex items-center gap-3">
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                border: `1.5px solid ${lang.color}`,
                color: lang.color,
                background: `${lang.color}10`,
                minWidth: 52,
                textAlign: "center",
              }}
            >
              {lang.name}
            </span>
            <div style={{ flex: 1, height: 8, background: "#F0E0CF", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(lang.solved / lang.total) * 100}%`,
                  background: lang.color,
                  borderRadius: 99,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
              {lang.solved} solved
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsCard() {
  return (
    <div className="card animate-fade-in-up" style={{ padding: 20, animationDelay: "0.2s" }}>
      <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px" }}>
        🔒 Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              background: skill.color,
              color: "white",
              cursor: "default",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${skill.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {skill.name} ×{skill.count}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActivityHeatmap() {
  const heatmap = useMemo(() => generateHeatmap(), []);

  return (
    <div className="card animate-fade-in-up" style={{ padding: 20, animationDelay: "0.05s" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          🔥 Solve Activity
        </h3>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
          Last 12 weeks
        </span>
      </div>

      <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
        {heatmap.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {week.map((level, di) => (
              <div
                key={`${wi}-${di}`}
                className="heatmap-cell"
                style={{ background: getHeatColor(level) }}
                title={`Week ${wi + 1}, Day ${di + 1}: ${level} submissions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5" style={{ marginTop: 12 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: getHeatColor(level),
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>More</span>
      </div>
    </div>
  );
}

function RecentSubmissions() {
  return (
    <div className="card animate-fade-in-up" style={{ padding: 20, animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Recent Submissions
        </h3>
        <Link
          href="/admin/problems"
          style={{ fontSize: 13, color: "var(--accent-orange)", fontWeight: 600, textDecoration: "none" }}
          className="hover:underline"
        >
          View all →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {recentSubmissions.map((sub, i) => (
          <div
            key={i}
            className="flex items-center justify-between"
            style={{
              padding: "12px 0",
              borderBottom: i < recentSubmissions.length - 1 ? "1px solid var(--border-light)" : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: sub.status === "accepted" ? "var(--accent-green)" : "var(--accent-red)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  {sub.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {sub.time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`badge ${
                  sub.difficulty === "Easy" ? "badge-easy" : sub.difficulty === "Medium" ? "badge-medium" : "badge-hard"
                }`}
              >
                {sub.difficulty}
              </span>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  border: `1.5px solid ${
                    sub.lang === "Python" ? "#3776AB" : sub.lang === "C++" ? "#7B42BC" : "#555"
                  }`,
                  color: sub.lang === "Python" ? "#3776AB" : sub.lang === "C++" ? "#7B42BC" : "#555",
                }}
              >
                {sub.lang}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DifficultyDistribution() {
  const total = difficultyDist.easy.count + difficultyDist.medium.count + difficultyDist.hard.count;
  const easyPct = (difficultyDist.easy.count / total) * 100;
  const medPct = (difficultyDist.medium.count / total) * 100;
  const hardPct = (difficultyDist.hard.count / total) * 100;

  return (
    <div className="card animate-fade-in-up" style={{ padding: 20, animationDelay: "0.15s" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
        Difficulty Distribution
      </h3>

      {/* Labels */}
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Easy</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--easy-text)" }}>{difficultyDist.easy.count}</span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Medium</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--medium-text)" }}>{difficultyDist.medium.count}</span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Hard</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--hard-text)" }}>{difficultyDist.hard.count}</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div
        style={{
          display: "flex",
          height: 14,
          borderRadius: 99,
          overflow: "hidden",
          gap: 3,
        }}
      >
        <div
          style={{
            width: `${easyPct}%`,
            background: difficultyDist.easy.color,
            borderRadius: "99px 0 0 99px",
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <div
          style={{
            width: `${medPct}%`,
            background: difficultyDist.medium.color,
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <div
          style={{
            width: `${hardPct}%`,
            background: difficultyDist.hard.color,
            borderRadius: "0 99px 99px 0",
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ==========================================
// Main Dashboard Page
// ==========================================
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          color: "var(--text-muted)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 24,
              height: 24,
              border: "3px solid var(--border-light)",
              borderTopColor: "var(--accent-orange)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 24px 48px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ProfileCard />
          <StatsCards />
          <LanguagesCard />
          <SkillsCard />
        </div>

        {/* Right Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ActivityHeatmap />
          <RecentSubmissions />
          <DifficultyDistribution />
        </div>
      </div>
    </div>
  );
}
