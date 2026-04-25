import { z } from "zod";

export const uuid = z.string().uuid();

export const SetTypeEnum = z.enum([
  "WARMUP",
  "WORKING",
  "RECOGNITION",
  "DROPSET",
  "REST_PAUSE",
  "FAILURE",
  "BACKOFF",
  "OTHER",
]);

export type SetType = z.infer<typeof SetTypeEnum>;

export const SET_TYPE_LABEL: Record<SetType, string> = {
  WARMUP: "Warm-up",
  WORKING: "Working",
  RECOGNITION: "Recognition",
  DROPSET: "Drop set",
  REST_PAUSE: "Rest-pause",
  FAILURE: "Failure",
  BACKOFF: "Back-off",
  OTHER: "Other",
};

export const idParams = z.object({ id: uuid });
