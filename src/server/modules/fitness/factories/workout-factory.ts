import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { WorkoutData } from "@/server/modules/fitness/data/workout-data";
import { WorkoutController } from "@/server/modules/fitness/controllers/workout-controller";

export function makeWorkoutController() {
  return new WorkoutController(new WorkoutData(prisma));
}
