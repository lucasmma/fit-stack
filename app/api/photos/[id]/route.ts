import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makePhotoController } from "@/server/factories/photo-factory";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makePhotoController();

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.delete),
);
