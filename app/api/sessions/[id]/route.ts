import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeSessionController } from "@/server/factories/session-factory";
import { idParams } from "@/lib/schemas/common";

export const runtime = "nodejs";

const controller = makeSessionController();

export const GET = withAuth(adaptRoute({ params: idParams }, controller.get));
