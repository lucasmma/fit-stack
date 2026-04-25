import { z } from "zod";
import { WorkoutDetailDTOSchema } from "./workout";

export const PlanDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  workoutCount: z.number().int().nonnegative(),
});

export type PlanDTO = z.infer<typeof PlanDTOSchema>;

export const PlanDetailDTOSchema = PlanDTOSchema.extend({
  workouts: z.array(WorkoutDetailDTOSchema),
});

export type PlanDetailDTO = z.infer<typeof PlanDetailDTOSchema>;

export const CreatePlanInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanInputSchema>;

export const UpdatePlanInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export type UpdatePlanInput = z.infer<typeof UpdatePlanInputSchema>;
