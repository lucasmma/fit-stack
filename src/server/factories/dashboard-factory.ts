import "server-only";
import { prisma } from "@/server/config/prisma";
import { DashboardData } from "@/server/data/dashboard-data";
import { DashboardController } from "@/server/presentation/controllers/dashboard-controller";

export function makeDashboardController() {
  return new DashboardController(new DashboardData(prisma));
}

export function makeDashboardData() {
  return new DashboardData(prisma);
}
