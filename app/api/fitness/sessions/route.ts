import { withAuth } from "@/server/shared/middlewares/with-auth";
import { adaptRoute } from "@/server/shared/route-adapters/adapt-route";
import { makeSessionController } from "@/server/modules/fitness/factories/session-factory";
import { CreateSessionInputSchema, SessionQuerySchema } from "@/lib/schemas/fitness/session";

export const runtime = "nodejs";

const controller = makeSessionController();

export const GET = withAuth(
  adaptRoute({ query: SessionQuerySchema }, controller.list),
);

export const POST = withAuth(
  adaptRoute({ body: CreateSessionInputSchema }, controller.create),
);
