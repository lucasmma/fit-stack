import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeShareController } from "@/server/modules/fitness/factories/share-factory";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makeShareController();

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.revoke),
);
