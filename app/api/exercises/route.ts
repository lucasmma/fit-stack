import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeExerciseController } from "@/server/factories/exercise-factory";
import { CreateExerciseInputSchema, ExerciseQuerySchema } from "@/lib/schemas/exercise";

export const runtime = "nodejs";

const controller = makeExerciseController();

export const GET = withAuth(
  adaptRoute({ query: ExerciseQuerySchema }, controller.list),
);

export const POST = withAuth(
  adaptRoute({ body: CreateExerciseInputSchema }, controller.create),
);
