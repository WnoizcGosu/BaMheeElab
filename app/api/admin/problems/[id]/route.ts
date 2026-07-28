import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existingProblem = await prisma.problem.findUnique({ where: { id } });
    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    const time_limit = data.time_limit !== undefined ? Number(data.time_limit) : (data.timeLimit !== undefined ? Number(data.timeLimit) : undefined);
    const memory_limit = data.memory_limit !== undefined ? Number(data.memory_limit) : (data.memoryLimit !== undefined ? Number(data.memoryLimit) : undefined);

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

    if (data.testCases) {
      await prisma.testCase.deleteMany({
        where: { problem_id: id }
      });

      const createPromises = data.testCases.map(async (tc: { id?: string, filename?: string, inputContent?: string, outputContent?: string, input_content?: string, output_content?: string, isPublic?: boolean, is_public?: boolean }, index: number) => {
        const tcId = tc.id || crypto.randomUUID();
        const inputContent = tc.input_content || tc.inputContent || "";
        const outputContent = tc.output_content || tc.outputContent || "";
        const isPublic = tc.is_public ?? tc.isPublic ?? false;

        let inputUrl = null;
        let outputUrl = null;

        // ไม่ดัก error ตรงนี้แล้วปล่อยผ่าน — ถ้า upload ไป MinIO ล้มเหลว ต้อง fail
        // การอัปเดต test case ทั้งก้อน (ให้ throw ขึ้นไปที่ catch ข้างนอก) ไม่งั้น
        // test case จะถูกสร้างแบบดูเหมือนสำเร็จทั้งที่ไฟล์จริงหายไป
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
    
    const submissionIds = submissions.map((s: typeof submissions[number]) => s.id);
    
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
