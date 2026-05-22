import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // In a real application, you would validate this data (e.g. using Zod)
    const formattedDesc = data.description;
    
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
        category: data.category || 'Programming',
        difficulty: data.difficulty || 'Easy',
        time_limit: Number(data.timeLimit),
        memory_limit: Number(data.memoryLimit),
        created_by: systemUser.id,
      }
    });

    if (data.testCases && data.testCases.length > 0) {
      const createPromises = data.testCases.map(async (tc: { id: string, filename?: string, inputContent?: string, outputContent?: string, isPublic?: boolean }, index: number) => {
        let inputUrl = null;
        let outputUrl = null;

        if (tc.inputContent) {
          const inputKey = `problems/${newProblem.id}/testcases/${tc.id}/input.txt`;
          await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: inputKey,
            Body: tc.inputContent,
            ContentType: "text/plain"
          }));
          inputUrl = `http://127.0.0.1:9000/${BUCKET_NAME}/${inputKey}`;
        }

        if (tc.outputContent) {
          const outputKey = `problems/${newProblem.id}/testcases/${tc.id}/output.txt`;
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
            problem_id: newProblem.id,
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

    // Remap for the client which expects camelCase properties
    const clientProblem = {
      ...newProblem,
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
