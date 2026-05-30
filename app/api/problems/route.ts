import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        category: true,
        // we can select tags or anything else here if needed
      }
    });

    const difficultyOrder: Record<string, number> = { "Easy": 1, "Medium": 2, "Hard": 3, "God": 4 };
    
    problems.sort((a, b) => {
      return (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
    });

    // Remap for the client component if necessary
    const formattedProblems = problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      status: "unsolved", // placeholder since we don't track user status in public list right now
      tags: [p.category],
    }));

    return NextResponse.json(formattedProblems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
