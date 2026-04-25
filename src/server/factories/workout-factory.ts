import "server-only";
import { prisma } from "@/server/config/prisma";
import { WorkoutData } from "@/server/data/workout-data";
import { WorkoutController } from "@/server/presentation/controllers/workout-controller";

export function makeWorkoutController() {
  return new WorkoutController(new WorkoutData(prisma));
}
