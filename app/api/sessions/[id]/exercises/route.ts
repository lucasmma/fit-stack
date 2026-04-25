import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeSessionController } from "@/server/factories/session-factory";
import { AddSessionExerciseInputSchema } from "@/lib/schemas/session";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeSessionController();

export const POST = withAuth(
  adaptRoute(
    { body: AddSessionExerciseInputSchema, params: idParams },
    controller.addExercise,
  ),
);
