import "server-only";
import type { PrismaClient } from "@prisma/client";
import { errors } from "@/server/presentation/helpers/http";
import type { S3UploadService } from "@/server/services/s3-upload/s3-upload";
import type {
  ConfirmPhotoInput,
  ConfirmPhotoSetInput,
  PhotoDTO,
} from "@/lib/schemas/photo";
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
    this.assertOwnedKey(userId, input.s3Key);
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
        pose: input.pose ?? null,
        photoSetId: input.photoSetId ?? null,
      },
    });
    const base = mapPhotoRow(row);
    const url = await this.s3.presignGet(base.s3Key);
    return { ...base, url };
  }

  async confirmSet(userId: string, input: ConfirmPhotoSetInput): Promise<PhotoDTO[]> {
    for (const photo of input.photos) {
      this.assertOwnedKey(userId, photo.s3Key);
    }
    const poses = new Set(input.photos.map((p) => p.pose));
    if (poses.size !== input.photos.length) {
      throw errors.badRequest("Each pose can only appear once per set.");
    }

    const takenAt = new Date(input.takenAt);
    const weekStartDate = new Date(`${input.weekStartDate}T00:00:00.000Z`);

    const rows = await this.prisma.$transaction(
      input.photos.map((photo) =>
        this.prisma.progressPhoto.create({
          data: {
            userId,
            s3Key: photo.s3Key,
            contentType: photo.contentType,
            bytes: photo.bytes ?? null,
            width: photo.width ?? null,
            height: photo.height ?? null,
            takenAt,
            weekStartDate,
            bodyWeightKg: input.bodyWeightKg ?? null,
            bodyFatPct: input.bodyFatPct ?? null,
            notes: input.notes ?? null,
            pose: photo.pose,
            photoSetId: input.photoSetId,
          },
        }),
      ),
    );

    return Promise.all(
      rows.map(async (row) => {
        const base = mapPhotoRow(row);
        const url = await this.s3.presignGet(base.s3Key);
        return { ...base, url };
      }),
    );
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

  private assertOwnedKey(userId: string, s3Key: string) {
    if (!s3Key.startsWith(`photos/${userId}/`)) {
      throw errors.forbidden("Key namespace mismatch.");
    }
  }
}
