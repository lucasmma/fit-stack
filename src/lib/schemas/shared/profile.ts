import { z } from "zod";

export const ProfileDTOSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
});

export type ProfileDTO = z.infer<typeof ProfileDTOSchema>;
