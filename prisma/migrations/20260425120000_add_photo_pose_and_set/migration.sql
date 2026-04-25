-- CreateEnum
CREATE TYPE "PhotoPose" AS ENUM ('FRONT', 'LEFT', 'BACK', 'RIGHT');

-- AlterTable
ALTER TABLE "progress_photos"
  ADD COLUMN "pose" "PhotoPose",
  ADD COLUMN "photoSetId" UUID;

-- CreateIndex
CREATE INDEX "progress_photos_userId_photoSetId_idx"
  ON "progress_photos" ("userId", "photoSetId");

-- CreateIndex
CREATE UNIQUE INDEX "progress_photos_photoSetId_pose_key"
  ON "progress_photos" ("photoSetId", "pose");
