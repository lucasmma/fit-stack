import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makePlanController } from "@/server/factories/plan-factory";
import { UpdatePlanInputSchema } from "@/lib/schemas/plan";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makePlanController();

export const GET = withAuth(adaptRoute({ params: idParams }, controller.get));

export const PATCH = withAuth(
  adaptRoute(
    { body: UpdatePlanInputSchema, params: idParams },
    controller.update,
  ),
);

export const DELETE = withAuth(
  adaptRoute({ params: idParams }, controller.delete),
);
