import { z } from "zod";

export const ShareScopeEnum = z.enum(["PROGRESS_ONLY", "WORKOUTS_ONLY", "ALL"]);
export type ShareScope = z.infer<typeof ShareScopeEnum>;

export const SHARE_SCOPE_LABEL: Record<ShareScope, string> = {
  PROGRESS_ONLY: "Progress (dashboard + photos)",
  WORKOUTS_ONLY: "Workouts (plans + sessions)",
  ALL: "Everything",
};

export const ShareLinkDTOSchema = z.object({
  id: z.string().uuid(),
  token: z.string(),
  name: z.string().nullable(),
  scope: ShareScopeEnum,
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  url: z.string().url(),
});
export type ShareLinkDTO = z.infer<typeof ShareLinkDTOSchema>;

export const CreateShareLinkInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  scope: ShareScopeEnum.default("PROGRESS_ONLY"),
  expiresAt: z.string().datetime().optional(),
});
export type CreateShareLinkInput = z.infer<typeof CreateShareLinkInputSchema>;
