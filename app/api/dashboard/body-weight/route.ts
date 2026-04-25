import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeDashboardController } from "@/server/factories/dashboard-factory";

export const runtime = "nodejs";

const controller = makeDashboardController();

export const GET = withAuth(adaptRoute({}, controller.bodyWeight));
