import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makePlanController } from "@/server/factories/plan-factory";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makePlanController();

export const POST = withAuth(
  adaptRoute({ params: idParams }, controller.activate),
);
