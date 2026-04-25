import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeExerciseController } from "@/server/modules/fitness/factories/exercise-factory";
import { CreateExerciseInputSchema, ExerciseQuerySchema } from "@/lib/schemas/fitness/exercise";

export const runtime = "nodejs";

const controller = makeExerciseController();

export const GET = withAuth(
  adaptRoute({ query: ExerciseQuerySchema }, controller.list),
);

export const POST = withAuth(
  adaptRoute({ body: CreateExerciseInputSchema }, controller.create),
);
