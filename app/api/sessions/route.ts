import { withAuth } from "@/server/middlewares/with-auth";
import { adaptRoute } from "@/server/route-adapters/adapt-route";
import { makeSessionController } from "@/server/factories/session-factory";
import { CreateSessionInputSchema, SessionQuerySchema } from "@/lib/schemas/session";

export const runtime = "nodejs";

const controller = makeSessionController();

export const GET = withAuth(
  adaptRoute({ query: SessionQuerySchema }, controller.list),
);

export const POST = withAuth(
  adaptRoute({ body: CreateSessionInputSchema }, controller.create),
);
