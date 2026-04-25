import "server-only";
import { prisma } from "@/server/config/prisma";
import { ProfileData } from "@/server/data/profile-data";
import { MeController } from "@/server/presentation/controllers/me-controller";

export function makeMeController() {
  return new MeController(new ProfileData(prisma));
}
