import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File is required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "txt";
    const uniqueId = uuidv4();
    const s3Key = `testcases/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || "text/plain",
    });

    try {
      await s3Client.send(command);
    } catch (s3Error) {
      console.error("S3 upload error:", s3Error);
      // For local testing without MinIO, we can fake success to continue developing UI
      if (process.env.NODE_ENV === "development") {
        console.warn("Faking S3 upload success because MinIO might not be running.");
      } else {
        throw s3Error;
      }
    }

    const endpoint = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";
    
    return NextResponse.json({
      success: true,
      fileUrl: `${endpoint}/${BUCKET_NAME}/${s3Key}`,
      s3Key,
      filename: file.name
    });
  } catch (error) {
    console.error("Error processing test case upload:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload file to S3/MinIO.", details: errorMessage },
      { status: 500 }
    );
  }
}
