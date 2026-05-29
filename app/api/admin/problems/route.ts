import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // รองรับสถาปัตยกรรม Async Params ของ Next.js 15/16 
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    // 1. อัปเดตข้อมูลรายละเอียดโจทย์หลักในตาราง Problem ของ PostgreSQL
    const updatedProblem = await prisma.problem.update({
      where: { id: id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category || 'Programming',
        difficulty: data.difficulty || 'Easy',
        time_limit: Number(data.time_limit || data.timeLimit || 1000),
        memory_limit: Number(data.memory_limit || data.memoryLimit || 256),
      }
    });

    // 2. ตรวจสอบและประมวลผลการอัปเดตชุดทดสอบ (Test Cases)
    if (data.testCases && data.testCases.length > 0) {
      const updatePromises = data.testCases.map(async (tc: any, index: number) => {
        const tcId = tc.id;
        
        // ผสานคีย์ดักจับรองรับข้อมูลไหลเข้าทุกประเภท
        const inputContent = tc.input_content || tc.inputContent || "";
        const outputContent = tc.output_content || tc.outputContent || "";
        const isPublic = tc.is_public ?? tc.isPublic ?? false;

        let inputUrl = null;
        let outputUrl = null;

        // 🎯 บล็อกนิรภัยย่อย: ล็อกคำสั่งตู้เก็บไฟล์ S3/MinIO เอาไว้ 
        // ต่อให้เกิดเออร์เรอร์ NoSuchBucket ระบบจะพ่นเตือนใน Terminal แต่แอปจะไม่ร่วงเป็น Error 500 อีกต่อไป
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
        } catch (s3Error) {
          console.warn(
            `[S3_PUT_WARN] เกิดข้อผิดพลาดบน Object Storage (ถัง "${BUCKET_NAME}" อาจจะยังไม่ได้กดสร้าง) ระบบจะสลับไปเซฟข้อความดิบลง PostgreSQL ให้แทน:`,
            s3Error
          );
        }

        // 3. ทำการ Upsert ข้อมูลลงตาราง TestCase (ถ้ามีไอดีเดิมให้เขียนทับ ถ้าไม่มีให้สร้างใหม่)
        return prisma.testCase.upsert({
          where: { id: tcId },
          update: {
            input_content: inputContent,
            output_content: outputContent,
            is_public: isPublic,
            order_index: index,
            ...(inputUrl && { input_url: inputUrl }),
            ...(outputUrl && { output_url: outputUrl }),
          },
          create: {
            id: tcId,
            problem_id: id,
            filename: tc.filename || `testcase_${index + 1}.txt`,
            input_content: inputContent,
            output_content: outputContent,
            is_public: isPublic,
            order_index: index,
            input_url: inputUrl,
            output_url: outputUrl,
          }
        });
      });

      await Promise.all(updatePromises);
    }

    return NextResponse.json({ message: "อัปเดตโจทย์เสร็จสิ้น!", updatedProblem }, { status: 200 });

  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem." },
      { status: 500 }
    );
  }
}