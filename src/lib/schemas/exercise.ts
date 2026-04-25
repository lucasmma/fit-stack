import { z } from "zod";

export const ExerciseDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  muscleGroup: z.string().nullable(),
  equipment: z.string().nullable(),
  description: z.string().nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type ExerciseDTO = z.infer<typeof ExerciseDTOSchema>;

export const CreateExerciseInputSchema = z.object({
  name: z.string().min(1).max(120),
  muscleGroup: z.string().max(60).optional(),
  equipment: z.string().max(60).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateExerciseInput = z.infer<typeof CreateExerciseInputSchema>;

export const ExerciseQuerySchema = z.object({
  q: z.string().trim().optional(),
});
