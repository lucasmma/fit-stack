import "server-only";
import { prisma } from "@/server/config/prisma";
import { PlanData } from "@/server/data/plan-data";
import { PlanController } from "@/server/presentation/controllers/plan-controller";

export function makePlanController() {
  return new PlanController(new PlanData(prisma));
}

export function makePlanData() {
  return new PlanData(prisma);
}
