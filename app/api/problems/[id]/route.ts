import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // รองรับ Next.js 16 Async Params
) {
  try {
    const { id } = await context.params;

    // ค้นหาโจทย์ข้อที่ตรงกับ ID พร้อมดึงตาราง TestCase พ่วงมาด้วย
    const problem = await prisma.problem.findUnique({
      where: { id: id },
      include: {
        test_cases: {
          where: { is_public: true }, // ดึงเฉพาะชุดทดสอบสาธารณะมาทำตัวอย่างโจทย์
          orderBy: { order_index: "asc" }
        }
      }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // 🎯 แปลงโครงสร้างข้อมูลจากดาต้าเบส (Prisma) ให้เข้าล็อกกับ Interface ที่หน้าบ้านรอใช้
    const formattedProblem = {
      id: problem.id, // ส่งออกไปเป็นข้อความรหัส UUID
      title: problem.title,
      difficulty: problem.difficulty,
      tags: [problem.category],
      completion: 0, // คุณสามารถคำนวณสถิติส่งตรงนี้เพิ่มในอนาคตได้
      description: problem.description,
      constraints: [
        `Time Limit: ${problem.time_limit} ms`,
        `Memory Limit: ${problem.memory_limit} MB`
      ],
      examples: problem.test_cases.map((tc) => ({
        input: tc.input_content || "",
        output: tc.output_content || "",
        explanation: "Sample Test Case"
      }))
    };

    return NextResponse.json(formattedProblem, { status: 200 });

  } catch (error) {
    console.error("[FETCH_SINGLE_PROBLEM_ERROR] หลังบ้านดึงข้อมูลโจทย์รายข้อพลาด:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}