/**
 * MinIO uploader for large submission outputs.
 *
 * The worker calls `uploadLargeOutput` only when stdout (or any single field)
 * exceeds the inline threshold (10 KB per CLAUDE.md). It returns a stable URL
 * we can store in `Submission.resultUrl`.
 *
 * Uses @aws-sdk/client-s3 against MinIO (S3-compatible). No extra dep needed.
 */
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const MINIO_REGION = process.env.MINIO_REGION || "us-east-1";

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "submissions";

/** Output larger than this gets uploaded to MinIO instead of inlined. */
export const INLINE_OUTPUT_LIMIT_BYTES = 10 * 1024;

const endpoint = `${MINIO_USE_SSL ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`;

declare global {
  // eslint-disable-next-line no-var
  var __minio: S3Client | undefined;
  // eslint-disable-next-line no-var
  var __minioBucketReady: boolean | undefined;
}

export const minioClient: S3Client =
  global.__minio ??
  new S3Client({
    region: MINIO_REGION,
    endpoint,
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // required for MinIO
  });

if (process.env.NODE_ENV !== "production") global.__minio = minioClient;

async function ensureBucket(): Promise<void> {
  if (global.__minioBucketReady) return;
  try {
    await minioClient.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
  } catch {
    try {
      await minioClient.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name;
      if (name !== "BucketAlreadyOwnedByYou" && name !== "BucketAlreadyExists") {
        throw e;
      }
    }
  }
  global.__minioBucketReady = true;
}

/**
 * Upload a string/buffer to MinIO under `submissions/{submissionId}/{name}`.
 * Returns a URL the API can hand to the frontend.
 */
export async function uploadLargeOutput(params: {
  submissionId: string;
  name: string;          // e.g. "stdout-tc-1.txt"
  body: string | Buffer;
  contentType?: string;
}): Promise<string> {
  await ensureBucket();
  const key = `submissions/${params.submissionId}/${params.name}`;
  await minioClient.send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: params.body,
      ContentType: params.contentType || "text/plain; charset=utf-8",
    })
  );
  return `${endpoint}/${MINIO_BUCKET}/${key}`;
}

/** True if the worker should offload this output instead of inlining it. */
export function shouldOffload(output: string | null | undefined): boolean {
  if (!output) return false;
  return Buffer.byteLength(output, "utf8") > INLINE_OUTPUT_LIMIT_BYTES;
}
