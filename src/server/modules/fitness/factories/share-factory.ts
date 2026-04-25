import "server-only";
import { prisma } from "@/server/shared/config/prisma";
import { ShareData } from "@/server/modules/fitness/data/share-data";
import { ShareController } from "@/server/modules/fitness/controllers/share-controller";

export function makeShareController() {
  return new ShareController(new ShareData(prisma));
}

export function makeShareData() {
  return new ShareData(prisma);
}
