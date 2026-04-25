/**
 * Standalone S3 presign+PUT test.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/test-s3-presign.ts
 *
 * Bypasses Next.js and the browser. Generates a presigned URL using the same
 * code path as the app, then performs a PUT with a 1KB dummy body and prints
 * the response. Prints the raw S3 XML on failure so we can see the real error.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

async function main() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    console.error("Missing one of AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env");
    process.exit(1);
  }

  console.log(`[env] region=${region} bucket=${bucket} accessKeyId=${accessKeyId.slice(0, 4)}…${accessKeyId.slice(-4)}`);

  const client = new S3Client({
    region,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: { accessKeyId, secretAccessKey },
  });

  const key = `photos/test/${randomUUID()}.bin`;

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 300 },
  );

  console.log(`\n[presigned URL]\n${url}\n`);

  const body = Buffer.from("hello from test-s3-presign");

  const res = await fetch(url, {
    method: "PUT",
    body,
    headers: { "content-type": "application/octet-stream" },
  });

  const text = await res.text();
  console.log(`[response] status=${res.status} ${res.statusText}`);
  console.log(`[response headers]`);
  res.headers.forEach((value, name) => console.log(`  ${name}: ${value}`));
  console.log(`[response body]\n${text || "(empty)"}\n`);

  if (res.ok) {
    console.log(`✅ PUT succeeded. Object key: ${key}`);
    console.log(`   You can clean it up with: aws s3 rm s3://${bucket}/${key} --region ${region}`);
  } else {
    console.log(`❌ PUT failed.`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
