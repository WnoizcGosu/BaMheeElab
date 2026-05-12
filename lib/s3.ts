import { S3Client } from "@aws-sdk/client-s3";

// Configure MinIO/S3 client
export const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1", // MinIO default is often us-east-1
  endpoint: process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || "testcases";
