import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePhotoController } from "@/server/modules/fitness/factories/photo-factory";
import { PhotoQuerySchema } from "@/lib/schemas/fitness/photo";

export const runtime = "nodejs";

const controller = makePhotoController();

export const GET = withAuth(
  adaptRoute({ query: PhotoQuerySchema }, controller.list),
);
