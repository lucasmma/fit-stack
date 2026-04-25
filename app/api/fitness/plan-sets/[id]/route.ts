import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/modules/fitness/factories/workout-factory";
import { UpdatePlanSetInputSchema } from "@/lib/schemas/fitness/workout";
import { idParams } from "@/lib/schemas/shared/common";

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
