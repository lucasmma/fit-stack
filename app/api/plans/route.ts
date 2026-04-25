import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makePlanController } from "@/server/factories/plan-factory";
import { CreatePlanInputSchema } from "@/lib/schemas/plan";

export const runtime = "nodejs";

const controller = makePlanController();

export const GET = withAuth(adaptRoute({}, controller.list));

export const POST = withAuth(
  adaptRoute({ body: CreatePlanInputSchema }, controller.create),
);
