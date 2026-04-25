import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/modules/fitness/factories/workout-factory";
import { CreatePlanSetInputSchema } from "@/lib/schemas/fitness/workout";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const POST = withAuth(
  adaptRoute(
    { body: CreatePlanSetInputSchema, params: idParams },
    controller.addSet,
  ),
);
