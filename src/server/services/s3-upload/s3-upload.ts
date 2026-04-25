import "server-only";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { getS3Client, getS3Bucket } from "@/server/config/s3";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class S3UploadService {
  private readonly client = getS3Client();
  private readonly bucket = getS3Bucket();

  async presignPut(input: {
    userId: string;
    contentType: string;
    bytes: number;
    ttlSeconds?: number;
  }): Promise<{ uploadUrl: string; s3Key: string; expiresIn: number }> {
    const ext = EXT[input.contentType] ?? "bin";
    const s3Key = `photos/${input.userId}/${randomUUID()}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: input.contentType,
      ContentLength: input.bytes,
    });
    const expiresIn = input.ttlSeconds ?? 300;
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    return { uploadUrl, s3Key, expiresIn };
  }

  async presignGet(s3Key: string, ttlSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
  }

  async delete(s3Key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: s3Key }));
  }
}
