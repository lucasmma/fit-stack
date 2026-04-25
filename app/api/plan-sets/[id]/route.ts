import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/factories/workout-factory";
import { UpdatePlanSetInputSchema } from "@/lib/schemas/workout";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const PATCH = withAuth(
  adaptRoute(
    { body: UpdatePlanSetInputSchema, params: idParams },
    controller.updateSet,
  ),
);

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.removeSet),
);
