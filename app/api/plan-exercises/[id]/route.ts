import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/factories/workout-factory";
import { UpdatePlanExerciseInputSchema } from "@/lib/schemas/workout";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const PATCH = withAuth(
  adaptRoute(
    { body: UpdatePlanExerciseInputSchema, params: idParams },
    controller.updateExercise,
  ),
);

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.removeExercise),
);
