import { z } from "zod";

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
});
export type ConfirmPhotoInput = z.infer<typeof ConfirmPhotoInputSchema>;

export const PhotoQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
