import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { ProfileData } from "@/server/modules/account/data/profile-data";
import { MeController } from "@/server/modules/account/controllers/me-controller";

export function makeMeController() {
  return new MeController(new ProfileData(prisma));
}
