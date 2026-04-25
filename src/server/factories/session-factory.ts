import "server-only";
import { prisma } from "@/server/config/prisma";
import { SessionData } from "@/server/data/session-data";
import { SessionController } from "@/server/presentation/controllers/session-controller";

export function makeSessionController() {
  return new SessionController(new SessionData(prisma));
}

export function makeSessionData() {
  return new SessionData(prisma);
}
