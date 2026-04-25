import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: env.AWS_REGION,
      credentials:
        env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

export function getS3Bucket(): string {
  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET is not configured");
  }
  return env.S3_BUCKET;
}
