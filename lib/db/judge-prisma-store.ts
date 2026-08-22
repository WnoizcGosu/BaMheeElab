// lib/db/judge-prisma-store.ts
import { prisma } from "@/lib/prisma";
import { SubmissionStatus as PrismaStatus } from "@prisma/client";
import { downloadTextFromUrl } from "@/lib/minio";

export interface TestCaseDTO {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

// ── 1. ดึงข้อมูลโจทย์พร้อม Test Cases ทั้งหมดมาจาก Postgres ──
export async function getProblemWithTestCases(problemId: string) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      test_cases: {
        orderBy: { order_index: "asc" }
      }
    }
  });

  if (!problem) return null;

  const testCases: TestCaseDTO[] = await Promise.all(
    problem.test_cases.map(async (tc) => {
      // input_content/output_content ว่างได้ถ้า test case ถูกเก็บเป็นไฟล์ใน MinIO
      // แทนที่จะ inline — ต้อง fallback ไปโหลดจาก input_url/output_url ไม่งั้น
      // จะตรวจกับสตริงว่างแบบเงียบๆ
      const input =
        tc.input_content ?? (tc.input_url ? await downloadTextFromUrl(tc.input_url) : null);
      const expectedOutput =
        tc.output_content ?? (tc.output_url ? await downloadTextFromUrl(tc.output_url) : null);
      if (input == null || expectedOutput == null) {
        throw new Error(
          `test case ${tc.id} has no input/output (neither inline content nor URL)`
        );
      }
      return {
        id: tc.id,
        input,
        expectedOutput,
        isHidden: !tc.is_public, // ถ้าไม่ใช่ Public แสดงว่าเป็น Hidden Test Case
      };
    })
  );

  return {
    id: problem.id,
    title: problem.title,
    timeLimit: problem.time_limit,       // แมปเข้าหา camelCase ของ Worker
    memoryLimit: problem.memory_limit,   // แมปเข้าหา camelCase ของ Worker
    testCases,
  };
}

// ── 2. อัปเดตสถานะระหว่างตรวจ (PENDING -> JUDGING) ──
export async function setSubmissionStatus(submissionId: string, status: string) {
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: status as PrismaStatus }
  });
}

// ── 3. บันทึกผลลัพธ์การตรวจรวม และรายละเอียดรายเคส (TestCaseResult) ลง Postgres ──
export async function finalizeSubmission(
  submissionId: string,
  data: {
    status: string;
    score: number;
    runtime: number | null;
    memory: number | null;
    resultUrl: string | null;
    results: any[];
  }
) {
  // ใช้ ท่า Transaction เพื่ออัปเดต Submission และสร้าง TestCaseResult พร้อมกันเพื่อป้องกันข้อมูลตกหล่น
  await prisma.$transaction([
    // อัปเดตตารางหลัก
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: data.status as PrismaStatus,
        score: data.score,
        runtime: data.runtime,
        memory: data.memory,
        result_url: data.resultUrl,
        judged_at: new Date()
      }
    }),
    // ล้างข้อมูลผลตรวจเคสเก่า (ถ้ามี) แล้วเขียนผลตรวจรายเคสตัวใหม่ลงตาราง TestCaseResult
    prisma.testCaseResult.deleteMany({ where: { submission_id: submissionId } }),
    prisma.testCaseResult.createMany({
      data: data.results.map((r) => ({
        submission_id: submissionId,
        test_case_id: r.testCaseId,
        passed: r.passed,
        status: (r.passed ? "ACCEPTED" : data.status) as PrismaStatus, // ดึงสเตตัสเฉพาะเจาะจงมาใส่
        runtime: r.runtime,
        memory: r.memory,
        actual_output: r.actualOutput,
        error_message: r.errorMessage
      }))
    })
  ]);
}

// ── 4. อัปเดตคะแนนที่ดีที่สุดของผู้เรียนลงตาราง Leaderboard ──
export async function upsertLeaderboardEntry(data: {
  userId: string;
  problemId: string;
  score: number;
  runtime: number | null;
  memory: number | null;
}) {
  // ตรวจเช็กประวัติเก่าก่อนว่าในฐานข้อมูลเคยได้คะแนนเท่าไหร่
  const existing = await prisma.leaderboardEntry.findUnique({
    where: {
      user_id_problem_id: { user_id: data.userId, problem_id: data.problemId }
    }
  });

  // ถ้าคะแนนใหม่สูงกว่าคะแนนเดิม หรือยังไม่เคยทำข้อนี้มาก่อน ให้ทำการบันทึกแต้มใหม่ทันที
  if (!existing || data.score >= existing.best_score) {
    await prisma.leaderboardEntry.upsert({
      where: {
        user_id_problem_id: { user_id: data.userId, problem_id: data.problemId }
      },
      update: {
        best_score: data.score,
        best_runtime: data.runtime,
        best_memory: data.memory,
      },
      create: {
        user_id: data.userId,
        problem_id: data.problemId,
        best_score: data.score,
        best_runtime: data.runtime,
        best_memory: data.memory,
      }
    });
  }
}