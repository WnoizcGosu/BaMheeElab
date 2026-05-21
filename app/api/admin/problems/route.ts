import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // In a real application, you would validate this data (e.g. using Zod)
    // We prepend the category and difficulty to the description, as Prisma schema does not have them.
    const formattedDesc = `**Category:** ${data.category || 'Programming'} | **Difficulty:** ${data.difficulty || 'Easy'}\n\n${data.description}`;
    
    // Default to a system user or something if no logged in user context
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@bamheelab.local' }
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@bamheelab.local',
          name: 'System Admin',
          role: 'ADMIN',
        }
      });
    }

    const newProblem = await prisma.problem.create({
      data: {
        title: data.title,
        description: formattedDesc,
        time_limit: Number(data.timeLimit),
        memory_limit: Number(data.memoryLimit),
        created_by: systemUser.id,
      }
    });

    // Remap for the client which expects camelCase properties
    const clientProblem = {
      ...newProblem,
      category: data.category,
      difficulty: data.difficulty,
      timeLimit: newProblem.time_limit,
      memoryLimit: newProblem.memory_limit,
      createdAt: newProblem.created_at,
      updatedAt: newProblem.updated_at,
    };

    return NextResponse.json(clientProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem." },
      { status: 500 }
    );
  }
}
