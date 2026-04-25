import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePhotoController } from "@/server/modules/fitness/factories/photo-factory";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makePhotoController();

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.delete),
);
