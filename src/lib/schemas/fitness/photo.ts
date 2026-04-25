import { z } from "zod";

export const PHOTO_POSES = ["FRONT", "LEFT", "BACK", "RIGHT"] as const;
export const PhotoPoseSchema = z.enum(PHOTO_POSES);
export type PhotoPose = z.infer<typeof PhotoPoseSchema>;

export const POSE_LABEL: Record<PhotoPose, string> = {
  FRONT: "Frente",
  LEFT: "Esquerda",
  BACK: "Costas",
  RIGHT: "Direita",
};

export const PhotoDTOSchema = z.object({
  id: z.string().uuid(),
  takenAt: z.string().datetime(),
  weekStartDate: z.string(),
  bodyWeightKg: z.number().nullable(),
  bodyFatPct: z.number().nullable(),
  notes: z.string().nullable(),
  url: z.string().url(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  pose: PhotoPoseSchema.nullable(),
  photoSetId: z.string().uuid().nullable(),
});
export type PhotoDTO = z.infer<typeof PhotoDTOSchema>;

export const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 10_000_000;

export const PresignInputSchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  bytes: z.number().int().min(1).max(MAX_PHOTO_BYTES),
});
export type PresignInput = z.infer<typeof PresignInputSchema>;

export const PresignDTOSchema = z.object({
  uploadUrl: z.string().url(),
  s3Key: z.string(),
  expiresIn: z.number().int(),
});
export type PresignDTO = z.infer<typeof PresignDTOSchema>;

export const ConfirmPhotoInputSchema = z.object({
  s3Key: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  bytes: z.number().int().min(1).max(MAX_PHOTO_BYTES).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  takenAt: z.string().datetime(),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bodyWeightKg: z.number().min(0).max(999).optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  pose: PhotoPoseSchema.optional(),
  photoSetId: z.string().uuid().optional(),
});
export type ConfirmPhotoInput = z.infer<typeof ConfirmPhotoInputSchema>;

export const ConfirmPhotoSetItemSchema = z.object({
  s3Key: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  bytes: z.number().int().min(1).max(MAX_PHOTO_BYTES).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  pose: PhotoPoseSchema,
});
export type ConfirmPhotoSetItem = z.infer<typeof ConfirmPhotoSetItemSchema>;

export const ConfirmPhotoSetInputSchema = z.object({
  photoSetId: z.string().uuid(),
  takenAt: z.string().datetime(),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bodyWeightKg: z.number().min(0).max(999).optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  photos: z.array(ConfirmPhotoSetItemSchema).min(1).max(PHOTO_POSES.length),
});
export type ConfirmPhotoSetInput = z.infer<typeof ConfirmPhotoSetInputSchema>;

export const PhotoQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
