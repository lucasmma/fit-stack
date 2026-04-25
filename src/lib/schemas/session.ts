import { z } from "zod";
import { SetTypeEnum } from "./common";
import { ExerciseDTOSchema } from "./exercise";

export const SessionSetDTOSchema = z.object({
  id: z.string().uuid(),
  sessionExerciseId: z.string().uuid(),
  order: z.number().int().nonnegative(),
  type: SetTypeEnum,
  label: z.string().nullable(),
  reps: z.number().int().nullable(),
  weight: z.number().nullable(),
  rpe: z.number().nullable(),
  completed: z.boolean(),
  completedAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
});
export type SessionSetDTO = z.infer<typeof SessionSetDTOSchema>;

export const SessionExerciseDTOSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  planExerciseId: z.string().uuid().nullable(),
  order: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  exercise: ExerciseDTOSchema,
  sets: z.array(SessionSetDTOSchema),
});
export type SessionExerciseDTO = z.infer<typeof SessionExerciseDTOSchema>;

export const SessionDTOSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  planName: z.string(),
  workoutId: z.string().uuid(),
  workoutName: z.string(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
});
export type SessionDTO = z.infer<typeof SessionDTOSchema>;

export const SessionSummaryDTOSchema = SessionDTOSchema.extend({
  exerciseCount: z.number().int().nonnegative(),
  completedSetCount: z.number().int().nonnegative(),
  totalSetCount: z.number().int().nonnegative(),
  totalVolume: z.number().nonnegative(),
});
export type SessionSummaryDTO = z.infer<typeof SessionSummaryDTOSchema>;

export const SessionDetailDTOSchema = SessionDTOSchema.extend({
  exercises: z.array(SessionExerciseDTOSchema),
});
export type SessionDetailDTO = z.infer<typeof SessionDetailDTOSchema>;

export const CreateSessionInputSchema = z.object({
  planId: z.string().uuid(),
  workoutId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

export const UpdateSessionSetInputSchema = z.object({
  reps: z.number().int().min(0).max(1000).nullable().optional(),
  weight: z.number().min(0).max(9999).nullable().optional(),
  rpe: z.number().min(0).max(10).nullable().optional(),
  completed: z.boolean().optional(),
  notes: z.string().max(500).nullable().optional(),
});
export type UpdateSessionSetInput = z.infer<typeof UpdateSessionSetInputSchema>;

export const AddSessionSetInputSchema = z.object({
  type: SetTypeEnum.default("WORKING"),
  label: z.string().max(60).optional(),
  reps: z.number().int().min(0).max(1000).optional(),
  weight: z.number().min(0).max(9999).optional(),
  rpe: z.number().min(0).max(10).optional(),
});
export type AddSessionSetInput = z.infer<typeof AddSessionSetInputSchema>;

export const AddSessionExerciseInputSchema = z.object({
  exerciseId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});
export type AddSessionExerciseInput = z.infer<typeof AddSessionExerciseInputSchema>;

export const SessionQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
