import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { DashboardData } from "@/server/modules/fitness/data/dashboard-data";
import { DashboardController } from "@/server/modules/fitness/controllers/dashboard-controller";

export function makeDashboardController() {
  return new DashboardController(new DashboardData(prisma));
}

export function makeDashboardData() {
  return new DashboardData(prisma);
}
