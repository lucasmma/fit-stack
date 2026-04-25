import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePlanController } from "@/server/modules/fitness/factories/plan-factory";
import { CreatePlanInputSchema } from "@/lib/schemas/fitness/plan";

export const runtime = "nodejs";

const controller = makePlanController();

export const GET = withAuth(adaptRoute({}, controller.list));

export const POST = withAuth(
  adaptRoute({ body: CreatePlanInputSchema }, controller.create),
);
