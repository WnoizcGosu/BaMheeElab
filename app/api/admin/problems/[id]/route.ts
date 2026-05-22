import { NextRequest, NextResponse } from "next/server";
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

    // Update problem fields if provided
    if (data.title || data.description || data.timeLimit || data.memoryLimit || data.category || data.difficulty) {
      await prisma.problem.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          time_limit: data.timeLimit ? Number(data.timeLimit) : undefined,
          memory_limit: data.memoryLimit ? Number(data.memoryLimit) : undefined,
        }
      });
    }

    if (data.testCases) {
      // First, delete existing test cases for simplicity (or update them)
      await prisma.testCase.deleteMany({
        where: { problem_id: id }
      });

      const createPromises = data.testCases.map(async (tc: { id: string, filename?: string, inputContent?: string, outputContent?: string, isPublic?: boolean }, index: number) => {
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
            filename: tc.filename || `testcase_${index}.txt`,
            input_url: inputUrl,
            output_url: outputUrl,
            input_content: tc.inputContent,
            output_content: tc.outputContent,
            is_public: tc.isPublic || false,
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
    
    // Ensure the problem exists
    const existingProblem = await prisma.problem.findUnique({ where: { id } });
    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    // Delete in order to satisfy foreign key constraints:
    // 1. TestCaseResult
    // 2. LeaderboardEntry
    // 3. Submission
    // 4. TestCase
    // 5. Problem
    
    // First find all submissions for this problem to delete their test case results
    const submissions = await prisma.submission.findMany({
      where: { problem_id: id },
      select: { id: true }
    });
    
    const submissionIds = submissions.map(s => s.id);
    
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
