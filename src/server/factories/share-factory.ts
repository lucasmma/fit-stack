import "server-only";
import { prisma } from "@/server/config/prisma";
import { ShareData } from "@/server/data/share-data";
import { ShareController } from "@/server/presentation/controllers/share-controller";

export function makeShareController() {
  return new ShareController(new ShareData(prisma));
}

export function makeShareData() {
  return new ShareData(prisma);
}
