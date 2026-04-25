import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeWorkoutController } from "@/server/factories/workout-factory";
import { CreateWorkoutInputSchema } from "@/lib/schemas/workout";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeWorkoutController();

export const POST = withAuth(
  adaptRoute(
    { body: CreateWorkoutInputSchema, params: idParams },
    controller.create,
  ),
);
