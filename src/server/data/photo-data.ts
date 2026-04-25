import "server-only";
import type { PrismaClient } from "@prisma/client";
import { errors } from "@/server/presentation/helpers/http";
import type { S3UploadService } from "@/server/services/s3-upload/s3-upload";
import type { ConfirmPhotoInput, PhotoDTO } from "@/lib/schemas/photo";
import { mapPhotoRow } from "./mappers";

export class PhotoData {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly s3: S3UploadService,
  ) {}

  async list(
    userId: string,
    query: { from?: string; to?: string } = {},
  ): Promise<PhotoDTO[]> {
    const rows = await this.prisma.progressPhoto.findMany({
      where: {
        userId,
        ...(query.from ? { takenAt: { gte: new Date(query.from) } } : {}),
        ...(query.to ? { takenAt: { lte: new Date(query.to) } } : {}),
      },
      orderBy: { takenAt: "desc" },
    });

    return Promise.all(
      rows.map(async (row) => {
        const base = mapPhotoRow(row);
        const url = await this.s3.presignGet(base.s3Key);
        return { ...base, url };
      }),
    );
  }

  async confirm(userId: string, input: ConfirmPhotoInput): Promise<PhotoDTO> {
    if (!input.s3Key.startsWith(`photos/${userId}/`)) {
      throw errors.forbidden("Key namespace mismatch.");
    }
    const row = await this.prisma.progressPhoto.create({
      data: {
        userId,
        s3Key: input.s3Key,
        contentType: input.contentType,
        bytes: input.bytes ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        takenAt: new Date(input.takenAt),
        weekStartDate: new Date(`${input.weekStartDate}T00:00:00.000Z`),
        bodyWeightKg: input.bodyWeightKg ?? null,
        bodyFatPct: input.bodyFatPct ?? null,
        notes: input.notes ?? null,
      },
    });
    const base = mapPhotoRow(row);
    const url = await this.s3.presignGet(base.s3Key);
    return { ...base, url };
  }

  async delete(photoId: string, userId: string): Promise<void> {
    const photo = await this.prisma.progressPhoto.findFirst({
      where: { id: photoId, userId },
      select: { id: true, s3Key: true },
    });
    if (!photo) throw errors.notFound("Photo not found");
    await this.prisma.progressPhoto.delete({ where: { id: photoId } });
    // Best-effort S3 cleanup; failure shouldn't throw since DB is the source of truth.
    try {
      await this.s3.delete(photo.s3Key);
    } catch {
      // ignore
    }
  }
}
