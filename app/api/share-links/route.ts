import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeShareController } from "@/server/factories/share-factory";
import { CreateShareLinkInputSchema } from "@/lib/schemas/share";

export const runtime = "nodejs";

const controller = makeShareController();

export const GET = withAuth(adaptRoute({}, controller.list));

export const POST = withAuth(
  adaptRoute({ body: CreateShareLinkInputSchema }, controller.create),
);
