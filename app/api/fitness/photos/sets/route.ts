import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePhotoController } from "@/server/modules/fitness/factories/photo-factory";
import { ConfirmPhotoSetInputSchema } from "@/lib/schemas/fitness/photo";

export const runtime = "nodejs";

const controller = makePhotoController();

export const POST = withAuth(
  adaptRoute({ body: ConfirmPhotoSetInputSchema }, controller.confirmSet),
);
