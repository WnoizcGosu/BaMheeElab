import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./s3";

export function shouldOffload(output: string | null | undefined): boolean {
  if (output == null) return false;
  return output.length > 10_000;
}

export async function uploadLargeOutput({
  submissionId,
  name,
  body,
}: {
  submissionId: string;
  name: string;
  body: string;
}): Promise<string> {
  const key = `${submissionId}/${name}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "text/plain; charset=utf-8",
    })
  );
  const endpoint = process.env.MINIO_ENDPOINT?.replace(/\/$/, "") || "http://127.0.0.1:9000";
  return `${endpoint}/${BUCKET_NAME}/${key}`;
}

export async function downloadTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}
