import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeDashboardController } from "@/server/modules/fitness/factories/dashboard-factory";

export const runtime = "nodejs";

const controller = makeDashboardController();

export const GET = withAuth(adaptRoute({}, controller.bodyWeight));
