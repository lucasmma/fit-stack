import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeShareController } from "@/server/modules/fitness/factories/share-factory";
import { CreateShareLinkInputSchema } from "@/lib/schemas/fitness/share";

export const runtime = "nodejs";

const controller = makeShareController();

export const GET = withAuth(adaptRoute({}, controller.list));

export const POST = withAuth(
  adaptRoute({ body: CreateShareLinkInputSchema }, controller.create),
);
