import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const problemId = uuidv4();

    // หา ADMIN user คนแรกที่มีใน DB (ยังไม่มี session auth)
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
      return NextResponse.json({ error: "No admin user found in DB" }, { status: 500 });
    }
    const adminUserId = adminUser.id; 

    const preparedTestCases = [];
    if (data.testCases && data.testCases.length > 0) {
      for (let i = 0; i < data.testCases.length; i++) {
        const tc = data.testCases[i];
        const tcId = tc.id || uuidv4();
        const inputContent = tc.input_content || tc.inputContent || "";
        const outputContent = tc.output_content || tc.outputContent || "";
        const isPublic = tc.is_public ?? tc.isPublic ?? false;

        let inputUrl = null;
        let outputUrl = null;

        try {
          if (inputContent) {
            const inputKey = `problems/${problemId}/testcases/${tcId}/input.txt`;
            await s3Client.send(new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: inputKey,
              Body: inputContent,
              ContentType: "text/plain"
            }));
            inputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${inputKey}`;
          }

          if (outputContent) {
            const outputKey = `problems/${problemId}/testcases/${tcId}/output.txt`;
            await s3Client.send(new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: outputKey,
              Body: outputContent,
              ContentType: "text/plain"
            }));
            outputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${outputKey}`;
          }
        } catch (s3Error) {
          console.warn(`[S3_POST_WARN] S3 Error:`, s3Error);
        }

        preparedTestCases.push({
          id: tcId,
          filename: tc.filename || `testcase_${i + 1}.txt`,
          input_content: inputContent,
          output_content: outputContent,
          is_public: isPublic,
          order_index: i,
          input_url: inputUrl,
          output_url: outputUrl,
        });
      }
    }

    const newProblem = await prisma.problem.create({
      data: {
        id: problemId,
        title: data.title,
        description: data.description,
        category: data.category || 'Programming',
        difficulty: data.difficulty || 'Easy',
        time_limit: Number(data.time_limit || data.timeLimit || 1000),
        memory_limit: Number(data.memory_limit || data.memoryLimit || 256),
        created_by: adminUserId,
        test_cases: {
          create: preparedTestCases
        }
      }
    });

    return NextResponse.json({ message: "สร้างโจทย์เสร็จสิ้น!", newProblem }, { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem." },
      { status: 500 }
    );
  }
}