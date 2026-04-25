import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeSessionController } from "@/server/factories/session-factory";
import { UpdateSessionSetInputSchema } from "@/lib/schemas/session";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeSessionController();

export const PATCH = withAuth(
  adaptRoute(
    { body: UpdateSessionSetInputSchema, params: idParams },
    controller.updateSet,
  ),
);

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.removeSet),
);
