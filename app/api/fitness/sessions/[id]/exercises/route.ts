import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeSessionController } from "@/server/modules/fitness/factories/session-factory";
import { AddSessionExerciseInputSchema } from "@/lib/schemas/fitness/session";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makeSessionController();

export const POST = withAuth(
  adaptRoute(
    { body: AddSessionExerciseInputSchema, params: idParams },
    controller.addExercise,
  ),
);
