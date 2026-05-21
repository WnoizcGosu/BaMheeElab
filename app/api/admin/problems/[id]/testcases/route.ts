import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const testCases = body.testCases;

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required." },
        { status: 400 }
      );
    }
    
    // Prevent Payload DoS & Ensure structural integrity
    if (testCases.length > 100) {
      return NextResponse.json({ error: "Too many test cases provided." }, { status: 413 });
    }
    
    for (const tc of testCases) {
      if (!tc.id || typeof tc.inputContent !== 'string' || typeof tc.outputContent !== 'string') {
        return NextResponse.json({ error: "Invalid test case format." }, { status: 400 });
      }
      if (tc.inputContent.length > 50000 || tc.outputContent.length > 50000) {
         return NextResponse.json({ error: "Test case payload size exceeds limit." }, { status: 413 });
      }
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    const createPromises = testCases.map(async (tc: { id: string, filename?: string, inputContent: string, outputContent: string, isPublic?: boolean }, index: number) => {
      let inputUrl = null;
      let outputUrl = null;

      if (tc.inputContent) {
        const inputKey = `problems/${id}/testcases/${tc.id}/input.txt`;
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: inputKey,
          Body: tc.inputContent,
          ContentType: "text/plain"
        }));
        inputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${inputKey}`;
      }

      if (tc.outputContent) {
        const outputKey = `problems/${id}/testcases/${tc.id}/output.txt`;
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: outputKey,
          Body: tc.outputContent,
          ContentType: "text/plain"
        }));
        outputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${outputKey}`;
      }

      return prisma.testCase.create({
        data: {
          id: tc.id,
          problem_id: id,
          filename: tc.filename || `testcase_${Date.now()}_${index}.txt`,
          input_url: inputUrl,
          output_url: outputUrl,
          input_content: tc.inputContent,
          output_content: tc.outputContent,
          is_public: tc.isPublic || false,
        }
      });
    });

    await Promise.all(createPromises);

    const updated = await prisma.problem.findUnique({
      where: { id },
      include: { test_cases: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adding test cases:", error);
    return NextResponse.json(
      { error: "Failed to add test cases." },
      { status: 500 }
    );
  }
}
