import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { PhotoData } from "@/server/modules/fitness/data/photo-data";
import { S3UploadService } from "@/server/shared/services/s3-upload/s3-upload";
import { PhotoController } from "@/server/modules/fitness/controllers/photo-controller";

export function makePhotoController() {
  const s3 = new S3UploadService();
  return new PhotoController(new PhotoData(prisma, s3), s3);
}

export function makePhotoData() {
  return new PhotoData(prisma, new S3UploadService());
}
