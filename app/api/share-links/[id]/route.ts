import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeShareController } from "@/server/factories/share-factory";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeShareController();

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.revoke),
);
