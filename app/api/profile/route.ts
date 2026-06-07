// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // ปรับ path ให้ตรงกับ auth ของคุณ
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. ดึงข้อมูล Submissions ทั้งหมดของ User พร้อมข้อมูล Problem
    const submissions = await prisma.submission.findMany({
      where: { user_id: userId },
      include: { problem: true },
      orderBy: { submitted_at: "desc" },
    });

    // 2. คำนวณ "ข้อที่ผ่านแล้ว" (Unique Solved Problems)
    const solvedProblemIds = new Set(
      submissions
        .filter((s) => s.status === "ACCEPTED")
        .map((s) => s.problem_id)
    );
    const totalSolved = solvedProblemIds.size;

    // 3. ประวัติล่าสุด (Recent Activity) - เอาแค่ 5 รายการแรก
    const recentActivity = submissions.slice(0, 5).map((s) => ({
      id: s.id,
      problem: s.problem.title,
      difficulty: s.problem.difficulty,
      lang: s.language === "PYTHON" ? "Python" : s.language === "CPP" ? "C++" : "C",
      status: s.status === "ACCEPTED" ? "solved" : "attempted",
      submittedAt: s.submitted_at,
    }));

    // 4. สถิติการใช้ภาษา (นับจากข้อที่ผ่าน)
    const langStats: Record<string, number> = { Python: 0, C: 0, "C++": 0 };
    const difficultyStats: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    
    // ใช้ Set เพื่อไม่ให้นับข้อเดิมซ้ำ
    const countedProblemsForStats = new Set<string>();

    submissions.forEach((s) => {
      if (s.status === "ACCEPTED" && !countedProblemsForStats.has(s.problem_id)) {
        countedProblemsForStats.add(s.problem_id);
        
        // ภาษา
        const langStr = s.language === "PYTHON" ? "Python" : s.language === "CPP" ? "C++" : "C";
        langStats[langStr] = (langStats[langStr] || 0) + 1;

        // ความยาก
        const diff = s.problem.difficulty;
        difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalSolved,
      recentActivity,
      languageStats: [
        { name: "Python", solved: langStats["Python"] || 0, color: "#3B82F6" },
        { name: "C", solved: langStats["C"] || 0, color: "#6B7280" },
        { name: "C++", solved: langStats["C++"] || 0, color: "#8B5CF6" },
      ],
      difficultyStats: [
        { label: "Easy", count: difficultyStats["Easy"] || 0, color: "#22C55E" },
        { label: "Medium", count: difficultyStats["Medium"] || 0, color: "#EAB308" },
        { label: "Hard", count: difficultyStats["Hard"] || 0, color: "#EF4444" },
      ],
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}