import "server-only";
import { prisma } from "@/server/config/prisma";
import { ExerciseData } from "@/server/data/exercise-data";
import { ExerciseController } from "@/server/presentation/controllers/exercise-controller";

export function makeExerciseController() {
  return new ExerciseController(new ExerciseData(prisma));
}

export function makeExerciseData() {
  return new ExerciseData(prisma);
}
