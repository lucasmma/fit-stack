import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makePlanController } from "@/server/modules/fitness/factories/plan-factory";
import { idParams } from "@/lib/schemas/shared/common";

export const runtime = "nodejs";

const controller = makePlanController();

export const POST = withAuth(
  adaptRoute({ params: idParams }, controller.activate),
);
