import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeDashboardController } from "@/server/factories/dashboard-factory";
import { PrsQuerySchema } from "@/lib/schemas/dashboard";

export const runtime = "nodejs";

const controller = makeDashboardController();

export const GET = withAuth(
  adaptRoute({ query: PrsQuerySchema }, controller.prs),
);
