import { z } from "zod";

export const VolumeQuerySchema = z.object({
  weeks: z.coerce.number().int().min(2).max(52).default(12),
});

export const PrsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});
