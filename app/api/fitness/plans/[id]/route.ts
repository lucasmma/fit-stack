import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePlanController } from "@/server/modules/fitness/factories/plan-factory";
import { UpdatePlanInputSchema } from "@/lib/schemas/fitness/plan";
import { idParams } from "@/lib/schemas/shared/common";

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
