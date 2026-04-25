import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/factories/workout-factory";
import { UpdateWorkoutInputSchema } from "@/lib/schemas/workout";
import { idParams } from "@/lib/schemas/common";

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
