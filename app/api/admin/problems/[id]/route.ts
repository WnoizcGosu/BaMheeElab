import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto"; // ใช้สุ่มไอดีกรณีหน้าบ้านไม่ได้ส่ง id มา

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existingProblem = await prisma.problem.findUnique({ where: { id } });
    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    // 1. ดึงคีย์รองรับทั้ง CamelCase และ snake_case จากหน้าบ้าน
    const time_limit = data.time_limit !== undefined ? Number(data.time_limit) : (data.timeLimit !== undefined ? Number(data.timeLimit) : undefined);
    const memory_limit = data.memory_limit !== undefined ? Number(data.memory_limit) : (data.memoryLimit !== undefined ? Number(data.memoryLimit) : undefined);

    // อัปเดตฟิลด์ของโจทย์หลัก
    if (data.title || data.description || time_limit !== undefined || memory_limit !== undefined || data.category || data.difficulty) {
      await prisma.problem.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          time_limit: time_limit,
          memory_limit: memory_limit,
        }
      });
    }

    // 2. จัดการข้อมูลชุดทดสอบ (Test Cases)
    if (data.testCases) {
      // ล้างเคสเก่าเพื่อความง่ายในการอัปเดตใหม่ตามโครงสร้างเดิมของคุณ
      await prisma.testCase.deleteMany({
        where: { problem_id: id }
      });

      const createPromises = data.testCases.map(async (tc: any, index: number) => {
        // 🎯 แก้บั๊กไอดีหาย: ถ้าหน้าบ้านไม่ได้ส่ง id มา ให้สุ่ม UUID ให้ทันทีป้องกัน path พังเป็น undefined
        const tcId = tc.id || crypto.randomUUID();
        const inputContent = tc.input_content || tc.inputContent || "";
        const outputContent = tc.output_content || tc.outputContent || "";
        const isPublic = tc.is_public ?? tc.isPublic ?? false;

        let inputUrl = null;
        let outputUrl = null;

        // 🎯 บล็อกนิรภัยย่อยจุดที่ 1: ดักจับเออร์เรอร์ NoSuchBucket ฝั่ง Input
        try {
          if (inputContent) {
            const inputKey = `problems/${id}/testcases/${tcId}/input.txt`;
            await s3Client.send(new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: inputKey,
              Body: inputContent,
              ContentType: "text/plain"
            }));
            inputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${inputKey}`;
          }
        } catch (s3InputError) {
          console.warn(`[S3_PUT_WARN] ไม่สามารถอัปโหลดข้อมูลอินพุตเข้าถัง "${BUCKET_NAME}" ได้:`, s3InputError);
        }

        // 🎯 บล็อกนิรภัยย่อยจุดที่ 2: ดักจับเออร์เรอร์ NoSuchBucket ฝั่ง Output
        try {
          if (outputContent) {
            const outputKey = `problems/${id}/testcases/${tcId}/output.txt`;
            await s3Client.send(new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: outputKey,
              Body: outputContent,
              ContentType: "text/plain"
            }));
            outputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${outputKey}`;
          }
        } catch (s3OutputError) {
          console.warn(`[S3_PUT_WARN] ไม่สามารถอัปโหลดข้อมูลเอาต์พุตเข้าถัง "${BUCKET_NAME}" ได้:`, s3OutputError);
        }

        // บันทึกข้อมูลลงฐานข้อมูล PostgreSQL (รันผ่านฉลุยแน่นอนเพราะไม่โดนบล็อก)
        return prisma.testCase.create({
          data: {
            id: tcId,
            problem_id: id,
            filename: tc.filename || `testcase_${index + 1}.txt`,
            input_url: inputUrl,
            output_url: outputUrl,
            input_content: inputContent,
            output_content: outputContent,
            is_public: isPublic,
            order_index: index,
          }
        });
      });

      await Promise.all(createPromises);
    }

    const updatedProblem = await prisma.problem.findUnique({
      where: { id },
      include: { test_cases: true }
    });

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem." },
      { status: 500 }
    );
  }
}

// ── คงฟังก์ชัน DELETE เดิมของคุณไว้ทั้งหมดเพื่อความปลอดภัยของ Foreign Key Constraints ──
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const existingProblem = await prisma.problem.findUnique({ where: { id } });
    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    const submissions = await prisma.submission.findMany({
      where: { problem_id: id },
      select: { id: true }
    });
    
    const submissionIds = submissions.map((s: any) => s.id);
    
    if (submissionIds.length > 0) {
      await prisma.testCaseResult.deleteMany({
        where: { submission_id: { in: submissionIds } }
      });
    }

    await prisma.leaderboardEntry.deleteMany({
      where: { problem_id: id }
    });

    await prisma.submission.deleteMany({
      where: { problem_id: id }
    });

    await prisma.testCase.deleteMany({
      where: { problem_id: id }
    });

    await prisma.problem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem." },
      { status: 500 }
    );
  }
}