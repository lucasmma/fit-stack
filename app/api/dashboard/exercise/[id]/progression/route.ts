import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeDashboardController } from "@/server/factories/dashboard-factory";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeDashboardController();

export const GET = withAuth(
  adaptRoute({ params: idParams }, controller.exerciseProgression),
);
