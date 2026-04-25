import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/factories/workout-factory";
import { CreatePlanSetInputSchema } from "@/lib/schemas/workout";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const POST = withAuth(
  adaptRoute(
    { body: CreatePlanSetInputSchema, params: idParams },
    controller.addSet,
  ),
);
