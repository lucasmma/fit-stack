import { z } from "zod";
import { SetTypeEnum } from "./common";
import { ExerciseDTOSchema } from "./exercise";

export const PlanSetDTOSchema = z.object({
  id: z.string().uuid(),
  planExerciseId: z.string().uuid(),
  order: z.number().int().nonnegative(),
  type: SetTypeEnum,
  label: z.string().nullable(),
  targetReps: z.number().int().nullable(),
  targetRepsMax: z.number().int().nullable(),
  targetWeight: z.number().nullable(),
  notes: z.string().nullable(),
});
export type PlanSetDTO = z.infer<typeof PlanSetDTOSchema>;

export const PlanExerciseDTOSchema = z.object({
  id: z.string().uuid(),
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  order: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  exercise: ExerciseDTOSchema,
  sets: z.array(PlanSetDTOSchema),
});
export type PlanExerciseDTO = z.infer<typeof PlanExerciseDTOSchema>;

export const WorkoutDTOSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number().int().nonnegative(),
});
export type WorkoutDTO = z.infer<typeof WorkoutDTOSchema>;

export const WorkoutDetailDTOSchema = WorkoutDTOSchema.extend({
  exercises: z.array(PlanExerciseDTOSchema),
});
export type WorkoutDetailDTO = z.infer<typeof WorkoutDetailDTOSchema>;

export const CreateWorkoutInputSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  order: z.number().int().nonnegative().optional(),
});
export type CreateWorkoutInput = z.infer<typeof CreateWorkoutInputSchema>;

export const UpdateWorkoutInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});
export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutInputSchema>;

export const AddPlanExerciseInputSchema = z.object({
  exerciseId: z.string().uuid(),
  notes: z.string().max(500).optional(),
  sets: z
    .array(
      z
        .object({
          type: SetTypeEnum.default("WORKING"),
          label: z.string().max(60).optional(),
          targetReps: z.number().int().min(0).max(1000).optional(),
          targetRepsMax: z.number().int().min(0).max(1000).optional(),
          targetWeight: z.number().min(0).max(9999).optional(),
          notes: z.string().max(500).optional(),
        })
        .refine(
          (s) =>
            s.targetReps == null ||
            s.targetRepsMax == null ||
            s.targetRepsMax >= s.targetReps,
          { message: "Max reps must be greater than or equal to min reps" },
        ),
    )
    .default([{ type: "WORKING", targetReps: 8 }]),
});
export type AddPlanExerciseInput = z.infer<typeof AddPlanExerciseInputSchema>;

export const UpdatePlanExerciseInputSchema = z.object({
  order: z.number().int().nonnegative().optional(),
  notes: z.string().max(500).nullable().optional(),
});
export type UpdatePlanExerciseInput = z.infer<typeof UpdatePlanExerciseInputSchema>;

export const CreatePlanSetInputSchema = z
  .object({
    type: SetTypeEnum.default("WORKING"),
    label: z.string().max(60).optional(),
    targetReps: z.number().int().min(0).max(1000).optional(),
    targetRepsMax: z.number().int().min(0).max(1000).optional(),
    targetWeight: z.number().min(0).max(9999).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (s) =>
      s.targetReps == null ||
      s.targetRepsMax == null ||
      s.targetRepsMax >= s.targetReps,
    { message: "Max reps must be greater than or equal to min reps" },
  );
export type CreatePlanSetInput = z.infer<typeof CreatePlanSetInputSchema>;

export const UpdatePlanSetInputSchema = z
  .object({
    type: SetTypeEnum.optional(),
    label: z.string().max(60).nullable().optional(),
    targetReps: z.number().int().min(0).max(1000).nullable().optional(),
    targetRepsMax: z.number().int().min(0).max(1000).nullable().optional(),
    targetWeight: z.number().min(0).max(9999).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    order: z.number().int().nonnegative().optional(),
  })
  .refine(
    (s) =>
      s.targetReps == null ||
      s.targetRepsMax == null ||
      s.targetRepsMax >= s.targetReps,
    { message: "Max reps must be greater than or equal to min reps" },
  );
export type UpdatePlanSetInput = z.infer<typeof UpdatePlanSetInputSchema>;
