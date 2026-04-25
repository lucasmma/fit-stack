import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeDashboardController } from "@/server/modules/fitness/factories/dashboard-factory";
import { VolumeQuerySchema } from "@/lib/schemas/fitness/dashboard";

export const runtime = "nodejs";

const controller = makeDashboardController();

export const GET = withAuth(
  adaptRoute({ query: VolumeQuerySchema }, controller.volume),
);
