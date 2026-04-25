import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makePhotoController } from "@/server/factories/photo-factory";
import { PresignInputSchema } from "@/lib/schemas/photo";

export const runtime = "nodejs";

const controller = makePhotoController();

export const POST = withAuth(
  adaptRoute({ body: PresignInputSchema }, controller.presign),
);
