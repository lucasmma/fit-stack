import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Auth } from "@/server/shared/presentation/protocols/http";

export type RouteContext<TParams = Record<string, string>> = {
  params: Promise<TParams>;
};

export type AuthedHandler<TParams = Record<string, string>> = (
  req: NextRequest,
  ctx: { auth: Auth; params: TParams },
) => Promise<Response>;

/**
 * HOF that guards a route handler behind a Supabase session. Handler bodies
 * never re-check auth — they trust `ctx.auth.userId` and enforce ownership
 * via Prisma `where: { userId }` filters.
 */
export function withAuth<TParams = Record<string, string>>(handler: AuthedHandler<TParams>) {
  return async (req: NextRequest, ctx: RouteContext<TParams>) => {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { code: "UNAUTHENTICATED", message: "Sign in to continue." },
        { status: 401 },
      );
    }

    const params = await ctx.params;
    return handler(req, {
      auth: { userId: user.id, email: user.email },
      params,
    });
  };
}
