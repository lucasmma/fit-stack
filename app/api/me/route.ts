import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeMeController } from "@/server/modules/account/factories/me-factory";

export const runtime = "nodejs";

const controller = makeMeController();

export const GET = withAuth(adaptRoute({}, controller.get));
