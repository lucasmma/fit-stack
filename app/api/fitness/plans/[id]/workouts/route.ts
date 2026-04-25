import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/modules/fitness/factories/workout-factory";
import { CreateWorkoutInputSchema } from "@/lib/schemas/fitness/workout";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const POST = withAuth(
  adaptRoute(
    { body: CreateWorkoutInputSchema, params: idParams },
    controller.create,
  ),
);
