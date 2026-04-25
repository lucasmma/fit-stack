import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { log } from "@/server/shared/config/log";
import { AppError } from "@/server/shared/presentation/helpers/http";
import type { Auth, Handler } from "@/server/shared/presentation/protocols/http";

type Schemas = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

type AdapterContext = {
  auth: Auth;
  params: Record<string, string>;
};

/**
 * Route-handler glue: validates with zod, invokes the controller, maps errors.
 * Route handlers wire `adaptRoute(schemas, handler)` inside `withAuth(...)`.
 *
 * Generic so each handler's narrower body/query/params types are preserved.
 */
export function adaptRoute<TBody, TQuery, TParams, TOutput>(
  schemas: Schemas,
  handler: Handler<TBody, TQuery, TParams, TOutput>,
) {
  return async (req: NextRequest, ctx: AdapterContext) => {
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

    try {
      enforceCsrf(req);

      const body = await parseBody(req, schemas.body);
      const query = parseQuery(req, schemas.query);
      const params = parseParams(ctx.params, schemas.params);

      const response = await handler({
        body: body as TBody,
        query: query as TQuery,
        params: params as TParams,
        auth: ctx.auth,
        requestId,
      });

      return NextResponse.json(response.body, {
        status: response.statusCode,
        headers: { "x-request-id": requestId },
      });
    } catch (err) {
      return handleError(err, requestId);
    }
  };
}

function enforceCsrf(req: NextRequest) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const contentType = req.headers.get("content-type") ?? "";
  const requestedWith = req.headers.get("x-requested-with") ?? "";
  const isJson = contentType.toLowerCase().startsWith("application/json");
  const isTagged = requestedWith === "personal-hq";

  if (!isJson && !isTagged) {
    throw new AppError(403, "FORBIDDEN", "Invalid cross-site request.");
  }
}

async function parseBody(req: NextRequest, schema?: z.ZodTypeAny) {
  if (!schema) return undefined;
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;
  let raw: unknown = undefined;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.issues);
  }
  return parsed.data;
}

function parseQuery(req: NextRequest, schema?: z.ZodTypeAny) {
  if (!schema) return undefined;
  const raw: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid query parameters.", parsed.error.issues);
  }
  return parsed.data;
}

function parseParams(params: Record<string, string>, schema?: z.ZodTypeAny) {
  if (!schema) return params;
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid path parameters.", parsed.error.issues);
  }
  return parsed.data;
}

function handleError(err: unknown, requestId: string) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { code: err.code, message: err.message, ...(err.issues ? { issues: err.issues } : {}) },
      { status: err.statusCode, headers: { "x-request-id": requestId } },
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Resource not found." },
        { status: 404, headers: { "x-request-id": requestId } },
      );
    }
    if (err.code === "P2002") {
      return NextResponse.json(
        { code: "CONFLICT", message: "Resource already exists." },
        { status: 409, headers: { "x-request-id": requestId } },
      );
    }
  }

  log.error("route.unhandled", { requestId, error: (err as Error)?.message });
  return NextResponse.json(
    { code: "INTERNAL", message: "Something went wrong." },
    { status: 500, headers: { "x-request-id": requestId } },
  );
}
