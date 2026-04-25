import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/modules/fitness/factories/workout-factory";
import { UpdateWorkoutInputSchema } from "@/lib/schemas/fitness/workout";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const GET = withAuth(adaptRoute({ params: idParams }, controller.get));

export const PATCH = withAuth(
  adaptRoute(
    { body: UpdateWorkoutInputSchema, params: idParams },
    controller.update,
  ),
);

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.delete),
);
