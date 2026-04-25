import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { ExerciseData } from "@/server/modules/fitness/data/exercise-data";
import { ExerciseController } from "@/server/modules/fitness/controllers/exercise-controller";

export function makeExerciseController() {
  return new ExerciseController(new ExerciseData(prisma));
}

export function makeExerciseData() {
  return new ExerciseData(prisma);
}
