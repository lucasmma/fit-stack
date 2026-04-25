import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { SessionData } from "@/server/modules/fitness/data/session-data";
import { SessionController } from "@/server/modules/fitness/controllers/session-controller";

export function makeSessionController() {
  return new SessionController(new SessionData(prisma));
}

export function makeSessionData() {
  return new SessionData(prisma);
}
