# Backend Architecture — fit-stack

This document describes the architecture to be used for the fit-stack backend, mirroring the pattern used by the `inventive-integrations` service (Node.js + Express + TypeScript). It follows a layered / Clean Architecture-inspired organization with a composition root pattern, validated request handling, and an HTTP-agnostic controller layer.

---

## 1. High-Level Layout

```
src/
├── index.ts                  # entrypoint: boot, graceful shutdown, crash handlers
├── types.d.ts                # global ambient types
├── utils.ts                  # cross-cutting pure helpers
├── main/                     # composition root — wires everything together
│   ├── config/               # app bootstrap (express, logger, clients, env)
│   ├── middlewares/          # express middlewares
│   ├── routes/               # route registration (grouped by audience)
│   ├── factories/            # builders that assemble controllers + deps
│   ├── route-adapters/       # express <-> controller glue + validation
│   ├── schemas/              # zod schemas for request validation
│   └── validators/           # domain-level validators
├── presentation/             # HTTP-facing layer (framework-agnostic)
│   ├── controllers/          # controllers return HttpResponse objects
│   ├── protocols/            # HttpRequest / HttpResponse contracts
│   └── helpers/              # ok / badRequest / serverError builders
├── services/                 # reusable infrastructure services
│   ├── encryption/
│   ├── s3-upload/
│   ├── schema/               # SchemaAdapter (zod wrapper)
│   └── helpers/
├── data/                     # data access layer
│   ├── models/               # domain models / DTOs
│   └── <provider>-data.ts    # repositories / gateways to external systems
└── __tests__/                # jest tests (mirrors src structure)
```

The key idea: **dependencies point inward.** `presentation` and `data` depend on `protocols` and domain types, never on `express`, Nango, or AWS SDKs directly. Only `main/` knows about the framework and concrete implementations — it wires them together.

---

## 2. Layer Responsibilities

### 2.1 `index.ts` — Entrypoint

Minimal. Imports instrumentation first (Sentry, source maps), starts the Express app, and installs process-level handlers:

- `SIGTERM` / `SIGINT` → graceful shutdown (drain connections, flush logger transport, exit).
- `uncaughtException` / `unhandledRejection` → flush logs, force-exit with code 1.
- Fallback `setTimeout(...).unref()` guards against hung shutdowns.

No business logic lives here.

### 2.2 `main/config/` — Bootstrap

One file per concern. Examples:

- `express.ts` — creates the `app`, applies middlewares, mounts routes, installs the Sentry error handler.
- `logger.ts` — pino logger with CloudWatch transport, `getLogger(scope)` factory.
- `instrument.ts` — **imported first** in `index.ts`; sets up Sentry / source-map-support.
- `config.ts` — reads `process.env`, exposes a typed config object.
- `<client>.ts` — singleton instances of external clients (Nango, S3, Redis, WorkOS, Slack).

Rule: every external SDK is instantiated here **once** and imported from here. Controllers never `new Nango(...)` themselves — they receive it via a factory.

### 2.3 `main/middlewares/` — Express Middlewares

Cross-cutting request concerns:

- `request-logger.ts` — assigns `req.requestId` (UUID), logs request/response, attaches child logger.
- `body-parser.ts`, `content-type.ts` — parse/validate content.
- `work-os.ts` — WorkOS JWT auth, populates `req.auth = { userId, orgId, permissions, role }`.
- Provider-specific folders (`nango/`, `firecrawl/`) contain middlewares that verify signatures, populate connection objects, etc.

Middlewares are registered in `main/config/middlewares.ts` in a strict order — `requestLogger` first because later middlewares depend on `req.requestId`.

### 2.4 `main/routes/` — Route Registration

Routes are grouped by **audience**, not by resource:

- `users/` — endpoints called from the frontend (WorkOS-authed).
- `internal/` — backend-to-backend (service tokens).
- `webhooks/` — third-party callbacks (signature-verified).

Each route file:
1. Creates a sub-router.
2. Builds the controller via its factory.
3. Registers handlers via `adaptRoute(controller, controller.method, schemaMap)`.
4. Mounts the sub-router with its middlewares under a path prefix.

Example pattern:
```ts
export const notionRoutes = (app: Router) => {
  const router = Router();
  const controller = makeNotionController();
  router.post("/sync-all-pages",
    adaptRoute(controller, controller.syncAllPages, { headers: nangoHeaderSchema }));
  app.use("/notion", populateNangoConnectionForUserMiddleware, router);
};
```

### 2.5 `main/factories/` — Composition

Tiny files whose only job is to build a controller with its dependencies:

```ts
export const makeNotionController = () => {
  const logger = getLogger("notion");
  return new NotionController(logger, nango);
};
```

This is the **only** place where concrete implementations meet controller constructors. It makes controllers trivially unit-testable — tests pass mocks directly.

### 2.6 `main/route-adapters/` — Framework Glue

`controller-route-adapter.ts` is the bridge between Express and the framework-agnostic controller layer. It:

1. Receives the Express `req, res`.
2. Builds a plain `HttpRequest` object (body, query, params, headers, auth, requestId, plus any populated fields like `nango_connection`).
3. Runs zod validation for any provided `schemaMap` (body/query/params/headers). On failure → 400 with parsed zod error.
4. Invokes `controller.handle(httpRequest)` and awaits an `HttpResponse`.
5. Catches thrown errors → maps to `badRequest` or `serverError`.
6. Writes status + JSON back to Express.

A second adapter, `sse-controller-route-adapter.ts`, adapts async-generator controllers to Server-Sent Events.

This inversion means **controllers never touch `req` / `res` directly**.

### 2.7 `main/schemas/` — Zod Schemas

One folder per integration/resource. Each schema is a zod object exported for reuse in both `adaptRoute` validation and TypeScript type inference (`z.infer<typeof Schema>` feeds controller signatures).

### 2.8 `presentation/protocols/` — HTTP Contract

Framework-agnostic shape of a request/response:

```ts
interface HttpRequest<T, Q, H> {
  body?: T; query?: Q; headers?: H; params?: {...};
  auth?: { userId, orgId, permissions, role };
  requestId?: string;
  /* populated fields */
}
interface HttpResponse { statusCode: number; body: any; }
```

### 2.9 `presentation/controllers/` — Controllers

- One class per resource/integration.
- Constructor takes dependencies (logger, clients, data repos) — no `new` inside.
- Each handler is an `async` method matching `(req: HttpRequest) => Promise<HttpResponse>`.
- Uses `ok(...)`, `badRequest(...)`, `serverError(...)` helpers — never calls `res.status(...).json(...)`.
- Derives a per-request child logger: `this.logger.child({ requestId: req.requestId })`.
- Delegates real work to `data/*` repositories or `services/*`.

### 2.10 `presentation/helpers/` — HTTP Helpers

`http-helper.ts` exports `ok`, `badRequest`, `serverError`, `unauthorized`, `forbidden`, `tooManyRequests` — each returns an `HttpResponse`. Centralizing this keeps status codes consistent and makes it easy to change the error body shape later.

### 2.11 `services/` — Reusable Infrastructure

Stateless (or singleton) services consumed by controllers and data layers:

- `schema/schema-adapter.ts` — zod wrapper used by the route adapter.
- `encryption/` — symmetric encryption utils.
- `s3-upload/` — chunked uploads via `@aws-sdk/lib-storage`.
- `helpers/` — mime types, HTML parsing, Slack helpers.

Services must not depend on controllers or routes.

### 2.12 `data/` — Data Access

- `<provider>-data.ts` — classes that talk to external APIs/DBs. Constructor takes the client + a logger.
- `models/` — plain TypeScript types, interfaces, and enums representing domain entities and DTOs.
- No express, no zod schemas from `main/` — just pure data operations.

This is the layer you swap when changing providers (e.g., switching a vector DB).

---

## 3. Request Lifecycle (End-to-End)

```
incoming HTTP
  → Express app (main/config/express.ts)
  → global middlewares: cors, requestLogger, bodyParser, contentType
  → mount-specific middleware: workOSAuthMiddleware / verifyNangoSignature / ...
  → route-level middleware: populateNangoConnection / ...
  → adaptRoute():
        build HttpRequest
        validate with SchemaAdapter (zod)
        call controller method
  → controller: pure logic, delegates to data/services
  → returns HttpResponse { statusCode, body }
  → adaptRoute writes status + JSON
  → Sentry error handler (last-resort)
```

Observability is threaded throughout via `req.requestId` and a child logger on the controller.

---

## 4. Conventions & Rules

1. **Composition root only in `main/`.** No other layer imports express, AWS SDKs, or third-party clients directly. If you need a client, receive it via constructor injection through a factory.
2. **Controllers never touch `req` / `res`.** They consume `HttpRequest`, return `HttpResponse`.
3. **Validation happens at the edge.** Every route that accepts input declares a `schemaMap` passed to `adaptRoute`. Types inside the controller are `z.infer<typeof Schema>` — no revalidation inside.
4. **One factory per controller.** Controllers are not `new`-ed anywhere except their factory.
5. **Logger is scoped.** `getLogger("scope")` at factory time; `.child({ requestId })` inside handlers.
6. **Graceful shutdown is mandatory** for anything with buffered I/O (log transports, queues).
7. **Tests mirror src.** `__tests__` reproduces the folder layout; controllers are tested by constructing them with fakes, no Express in the loop.
8. **No business logic in `main/`.** Main wires things; behavior lives in `presentation` + `data` + `services`.
9. **Route files are declarative.** They only register routes; no logic, no conditionals beyond env-gating.
10. **Error handling is centralized** in the route adapter. Controllers may throw; the adapter maps to 400/500. Explicit `badRequest`/`serverError` returns are used when the controller wants to shape the response itself.

---

## 5. Stack Summary

- **Runtime:** Node.js (TypeScript, strict mode).
- **Framework:** Express 4.
- **Validation:** Zod (via `SchemaAdapter`).
- **Logging:** pino + CloudWatch transport.
- **Monitoring:** Sentry (installed before anything else).
- **Auth (users):** WorkOS JWT.
- **Build:** `tsc` → `dist/`; `concurrently "tsc --watch" "nodemon dist/index.js"` for dev.
- **Testing:** Jest + ts-jest.
- **Lint/Format:** ESLint + Prettier.

---

## 6. When Adding a New Resource (checklist)

1. Define zod schema(s) in `main/schemas/<resource>/`.
2. Define domain models in `data/models/<resource>.ts` (if needed).
3. Implement `data/<resource>-data.ts` — external calls only, logger + client via constructor.
4. Implement `presentation/controllers/<audience>/<resource>-controller.ts` — one method per endpoint, returns `HttpResponse`.
5. Create `main/factories/<resource>-factory.ts` that wires the controller with its deps.
6. Create `main/routes/<audience>/<resource>-routes.ts` and register each endpoint with `adaptRoute` + schemaMap.
7. Mount the new router in `main/routes/<audience>/index.ts`.
8. Add tests in `__tests__/` mirroring the new paths.

Follow the checklist top-to-bottom and the layering rules fall out automatically.
