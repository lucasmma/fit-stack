import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { PlanData } from "@/server/modules/fitness/data/plan-data";
import { PlanController } from "@/server/modules/fitness/controllers/plan-controller";

export function makePlanController() {
  return new PlanController(new PlanData(prisma));
}

export function makePlanData() {
  return new PlanData(prisma);
}
