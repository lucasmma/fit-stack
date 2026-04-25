import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeMeController } from "@/server/factories/me-factory";

export const runtime = "nodejs";

const controller = makeMeController();

export const GET = withAuth(adaptRoute({}, controller.get));
