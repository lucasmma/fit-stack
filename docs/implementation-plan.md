# fit-stack — Implementation Plan

> Companion to `ideas.md` and `backend-architecture.md`. This document is the
> source of truth for **how** we will build fit-stack. It is organized so that
> each phase is independently deliverable and testable.

---

## 1. Executive Summary

fit-stack is a personal fitness tracking app for:

- managing **plans** (groupings of workout templates, e.g. PPL, Upper/Lower),
- configuring each **workout** day with exercises and sets,
- **logging gym sessions** (actual reps/weights per set),
- viewing a **calendar** of past sessions,
- a **dashboard** with progress charts,
- **weekly progress photos** stored in S3,
- a **public share link** so friends/coaches can view progress read-only.

Accounts are provisioned by an admin script (no self-signup in v1).

We will ship this as a **single Next.js (App Router) application** deployed on Vercel:

- Frontend: React server/client components + Tailwind + HeroUI.
- Backend: Next.js Route Handlers under `app/api/*`, layered per
  `backend-architecture.md` (composition root, controllers, data layer) —
  adapted to Next.js instead of Express.

Zod schemas and Prisma types live in `src/lib/` and are imported directly by
both server code (route handlers, server components) and client code. No
monorepo, no workspaces, no published packages.

---

## 2. Goals and Non-Goals

### In scope (v1)

- Email/password login via Supabase Auth (admin-seeded users).
- Plans → Workouts → Exercises → Sets (template).
- Gym session: start from a plan's workout, log actual reps/weight per set.
- Calendar of past sessions with drill-down.
- Dashboard: per-exercise volume/weight progression, frequency, recent PRs.
- Progress photos (weekly) with optional body-weight entry.
- Revocable, tokenised public share link with configurable scope.
- Deploys to Vercel (single service); Supabase-managed Postgres; AWS S3 for images.

### Explicitly **not** in scope for v1

- Self-signup, password reset flows beyond what Supabase provides out of the
  box, OAuth social providers.
- Rest timers, exercise video library, AI-generated routines, nutrition.
- Social graph (follow/feed), notifications, email digests.
- Native mobile app (web is mobile-responsive).
- Multi-tenant/org features.
- **Automated tests.** v1 ships without unit, integration, or E2E tests —
  we rely on manual verification per phase. Add a test harness in v2 once
  the surface area stabilises.

Flagging these up front keeps the schema and UI from bloating.

---

## 3. Key Technical Decisions

Each decision is listed with the trade-off it resolves. Items marked
**[Confirm]** are reasonable defaults that the user may want to override
before Phase 0 begins.

| #   | Decision                                                          | Rationale                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Single Next.js app** (App Router) with Route Handlers           | Frontend and backend ship together. Zod schemas and Prisma types are imported directly — no packages, no workspaces. One deploy, one env file, one `package.json`.                                                                   |
| 2   | **`@supabase/ssr` for session cookies**                           | Server components and route handlers read the session via HTTP-only cookies. Server components can call the data layer directly; client components call route handlers.                                                              |
| 3   | **Supabase Auth** (not custom JWT)                                | Handles hashing, JWT issuance, session refresh, revocation. Admin-provisioned users via the Admin API in a seed script. Route-handler middleware verifies the session using `@supabase/ssr`.                                         |
| 4   | **Prisma ORM** against Supabase Postgres                          | Our tables live in `public`; Supabase's `auth` schema is untouched. We reference `auth.users.id` (UUID) in our tables but do not create a cross-schema FK (Prisma manages `public` only).                                            |
| 5   | **Layered backend inside Next.js** per `backend-architecture.md`  | Keep the composition root / controllers / data-layer split. Route Handlers replace Express routes; a `withAuth()` wrapper replaces `supabaseAuthMiddleware`; `adaptRoute` becomes a small helper that runs zod on the `Request`.     |
| 6   | **Zod everywhere**                                                | Schemas live in `src/lib/schemas/`. Route handlers parse at the edge; frontend uses the same file in the form hook. Single source of truth, no cross-package plumbing.                                                               |
| 7   | **Form hook:** wrap `react-hook-form` + `@hookform/resolvers/zod` | "Custom hook" per `ideas.md` interpreted as _our_ hook on top of a battle-tested library. Removes boilerplate and makes `<Field />` ergonomic.                                                                                       |
| 8   | **Charts: Recharts**                                              | Mature, React-native, responsive, good enough for the v1 dashboards. Tremor can be layered later if we want dashboard primitives.                                                                                                    |
| 9   | **Toasts: HeroUI's toast / Sonner**                               | HeroUI ships a toast primitive; if gaps appear, fall back to Sonner. Pick one — do not mix. **[Confirm]**                                                                                                                            |
| 10  | **S3 direct upload via presigned URLs**                           | Large image uploads never transit our server. A route handler issues a short-lived presigned PUT with content-type and size restrictions; client PUTs direct to S3; client then POSTs a "confirm" with the S3 key.                   |
| 11  | **Authorization in the data layer**                               | Since we use Supabase's service-role key on the server, RLS is bypassed. We enforce ownership with `where: { userId }` in every Prisma query plus an `assertOwns()` helper in repositories.                                          |
| 12  | **Share links are opaque tokens**, not JWTs                       | 32-byte random base64url string stored server-side with scope, expiry, and revoked_at. No crypto binding needed; revocation works by deletion.                                                                                       |
| 13  | **Logger: thin `log.*` wrapper over `console`**                   | A `src/server/config/log.ts` module exposes `log.info/warn/error(msg, fields?)` that calls `console.*` with `JSON.stringify(fields)`. Vercel captures stdout; pino is overkill for v1. Having one choke point means swapping in pino later is a one-file change, and `redact()` lives here too. Client code uses `console` directly (or Sentry browser). |

---

## 4. Repository Structure

```
fit-stack/                            # single Next.js 14+ app
├── app/
│   ├── (auth)/login/
│   ├── (app)/                        # authed layout group
│   │   ├── plans/
│   │   ├── workouts/
│   │   ├── sessions/
│   │   │   └── [id]/                # active gym session
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── photos/
│   │   └── settings/
│   ├── share/[token]/                # public, unauthed
│   ├── api/
│   │   ├── auth/callback/           # Supabase cookie exchange
│   │   ├── me/
│   │   ├── plans/
│   │   ├── workouts/
│   │   ├── exercises/
│   │   ├── sessions/
│   │   ├── session-sets/
│   │   ├── session-exercises/
│   │   ├── photos/
│   │   ├── share-links/
│   │   ├── public/share/[token]/    # token-auth, rate-limited
│   │   ├── dashboard/
│   │   └── healthz/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                           # HeroUI wrappers / primitives
│   ├── forms/                        # Field, FormRoot, SubmitButton
│   ├── charts/                       # Recharts wrappers
│   └── features/                     # plan card, session card, etc.
├── src/
│   ├── lib/
│   │   ├── api-client.ts             # typed fetch wrapper (client)
│   │   ├── supabase/                 # server + browser clients
│   │   ├── schemas/                  # zod schemas (shared server + client)
│   │   │   ├── plan.ts
│   │   │   ├── workout.ts
│   │   │   ├── session.ts
│   │   │   ├── photo.ts
│   │   │   └── share.ts
│   │   ├── hooks/
│   │   │   ├── use-zod-form.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-session-timer.ts
│   │   └── utils/
│   └── server/                       # server-only code (backend layering)
│       ├── config/
│       │   ├── instrument.ts
│       │   ├── env.ts
│       │   ├── log.ts              # thin wrapper over console + redact()
│       │   ├── prisma.ts
│       │   ├── supabase.ts
│       │   └── s3.ts
│       ├── middlewares/
│       │   └── with-auth.ts          # Supabase session guard
│       ├── route-adapters/
│       │   └── adapt-route.ts        # zod parse + error mapping for handlers
│       ├── presentation/
│       │   ├── controllers/
│       │   ├── protocols/
│       │   └── helpers/
│       ├── services/
│       │   ├── s3-upload/
│       │   └── helpers/
│       ├── data/
│       │   ├── models/
│       │   ├── plan-data.ts
│       │   ├── session-data.ts
│       │   └── …
│       ├── factories/
│       └── scripts/
│           └── seed-user.ts          # admin-provision CLI (tsx)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                       # exercise catalog seed
├── docs/
│   ├── backend-architecture.md
│   └── implementation-plan.md        # (this file)
├── .env.example
├── .editorconfig
├── .gitignore
├── .nvmrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

Notes on structure:

- One `package.json`, one `tsconfig.json`, one lockfile. No workspaces.
- `src/server/` is server-only. To keep accidental client imports out, mark
  the top-level files with `import "server-only"` and (optionally) enforce
  via an ESLint `no-restricted-imports` rule on `components/**`.
- `src/lib/schemas/` is runtime-free (no Node/DOM APIs, just zod) and is
  imported by both server code and client components.
- `prisma/` sits at the project root; `@prisma/client` is imported from
  `src/server/config/prisma.ts` (singleton).

---

## 5. Environment Configuration

One `.env.example` at the project root. The real `.env.local` is git-ignored.

### `.env.example`

```dotenv
# Runtime
NODE_ENV=development
LOG_LEVEL=info

# Database (Supabase Postgres)
# Pooled URL (port 6543) for app queries; direct URL (5432) for migrations.
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

# Supabase — public (browser-safe)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase — server-only
SUPABASE_SERVICE_ROLE_KEY=           # never expose via NEXT_PUBLIC_*
SUPABASE_JWT_SECRET=                 # HS256 shared secret for verifying JWTs

# AWS S3 (server-only)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=fit-stack-photos
S3_PUBLIC_READ=false                 # we serve via presigned GET

# Observability (optional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

**Rule:** only variables prefixed `NEXT_PUBLIC_` are bundled into the client.
`SUPABASE_SERVICE_ROLE_KEY`, `AWS_*`, and `SUPABASE_JWT_SECRET` must never be
referenced from client components or they leak into the browser bundle.
Parse and expose env through `src/server/config/env.ts` (zod-validated) so
the server has a single typed entry point.

---

## 6. Database Schema (Prisma)

The schema below is the **target** after all phases. Migrations will deliver
it incrementally (see Phase sections). All user-owned tables include
`user_id uuid` indexed and filtered in every query.

```prisma
// prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]  // Vercel AL2 target
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Mirror table for the current user. Populated by the admin-seed script
// (or a Postgres trigger) when a Supabase auth.users row is created.
model Profile {
  id        String   @id @db.Uuid            // == auth.users.id
  email     String   @unique
  fullName  String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  plans         Plan[]
  sessions      Session[]
  photos        ProgressPhoto[]
  shareLinks    ShareLink[]
  customExercises Exercise[]

  @@map("profiles")
}

// Catalog of exercises. `ownerId = null` means global catalog.
model Exercise {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  muscleGroup String?
  equipment   String?
  description String?
  ownerId     String?  @db.Uuid
  owner       Profile? @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  planExercises    PlanExercise[]
  sessionExercises SessionExercise[]

  @@index([ownerId])
  @@map("exercises")
}

model Plan {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  isActive    Boolean  @default(false)
  archivedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workouts  Workout[]
  sessions  Session[]

  @@index([userId])
  @@map("plans")
}

model Workout {
  id          String   @id @default(uuid()) @db.Uuid
  planId      String   @db.Uuid
  plan        Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  name        String
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  exercises PlanExercise[]
  sessions  Session[]

  @@index([planId])
  @@map("workouts")
}

model PlanExercise {
  id         String   @id @default(uuid()) @db.Uuid
  workoutId  String   @db.Uuid
  workout    Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  exerciseId String   @db.Uuid
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  order      Int      @default(0)
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  sets             PlanSet[]
  sessionExercises SessionExercise[]

  @@index([workoutId])
  @@map("plan_exercises")
}

enum SetType {
  WARMUP
  WORKING
  RECOGNITION
  DROPSET
  REST_PAUSE
  FAILURE
  BACKOFF
  OTHER
}

model PlanSet {
  id             String       @id @default(uuid()) @db.Uuid
  planExerciseId String       @db.Uuid
  planExercise   PlanExercise @relation(fields: [planExerciseId], references: [id], onDelete: Cascade)
  order          Int          @default(0)
  type           SetType      @default(WORKING)
  label          String?       // free-form when type = OTHER
  targetReps     Int?
  targetWeight   Decimal?      @db.Decimal(6, 2)  // kg, 0..9999.99
  notes          String?

  @@index([planExerciseId])
  @@map("plan_sets")
}

model Session {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        Profile   @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId      String    @db.Uuid
  plan        Plan      @relation(fields: [planId], references: [id], onDelete: Restrict)
  workoutId   String    @db.Uuid
  workout     Workout   @relation(fields: [workoutId], references: [id], onDelete: Restrict)
  startedAt   DateTime  @default(now())
  finishedAt  DateTime?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  exercises SessionExercise[]

  @@index([userId, startedAt])
  @@map("sessions")
}

model SessionExercise {
  id              String        @id @default(uuid()) @db.Uuid
  sessionId       String        @db.Uuid
  session         Session       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exerciseId      String        @db.Uuid
  exercise        Exercise      @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  planExerciseId  String?       @db.Uuid
  planExercise    PlanExercise? @relation(fields: [planExerciseId], references: [id], onDelete: SetNull)
  order           Int           @default(0)
  notes           String?

  sets SessionSet[]

  @@index([sessionId])
  @@map("session_exercises")
}

model SessionSet {
  id                 String          @id @default(uuid()) @db.Uuid
  sessionExerciseId  String          @db.Uuid
  sessionExercise    SessionExercise @relation(fields: [sessionExerciseId], references: [id], onDelete: Cascade)
  order              Int             @default(0)
  type               SetType         @default(WORKING)
  label              String?
  reps               Int?
  weight             Decimal?        @db.Decimal(6, 2)
  rpe                Decimal?        @db.Decimal(3, 1)   // 0.0..10.0
  completed          Boolean         @default(false)
  notes              String?

  @@index([sessionExerciseId])
  @@map("session_sets")
}

model ProgressPhoto {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @db.Uuid
  user           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  s3Key          String                                // not a URL — render via presigned GET
  contentType    String
  width          Int?
  height         Int?
  bytes          Int?
  takenAt        DateTime
  weekStartDate  DateTime @db.Date
  bodyWeightKg   Decimal? @db.Decimal(5, 2)
  bodyFatPct     Decimal? @db.Decimal(4, 1)
  notes          String?
  createdAt      DateTime @default(now())

  @@index([userId, takenAt])
  @@map("progress_photos")
}

enum ShareScope {
  PROGRESS_ONLY   // dashboard + photos
  WORKOUTS_ONLY   // plans + sessions
  ALL             // everything
}

model ShareLink {
  id         String      @id @default(uuid()) @db.Uuid
  userId     String      @db.Uuid
  user       Profile     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token      String      @unique
  name       String?
  scope      ShareScope  @default(PROGRESS_ONLY)
  expiresAt  DateTime?
  revokedAt  DateTime?
  createdAt  DateTime    @default(now())

  @@index([userId])
  @@map("share_links")
}
```

### Schema notes and invariants

- **One active plan per user.** Enforced in the `PlanController.activate`
  handler: wrap the update in a transaction that sets `isActive = false` on
  all other plans of that user before flipping the new one to `true`. (A
  partial unique index on `(userId) WHERE isActive` would be cleaner; Prisma
  does not yet support filtered unique indexes declaratively, so add it via
  a raw-SQL migration step if desired.)
- **Session immutability window.** After a session is finished, edits are
  still allowed (to fix typos) but we should log and consider freezing after
  e.g. 7 days in a later iteration.
- **Soft-delete by archive.** `Plan.archivedAt` is set instead of deleting
  so historical sessions retain their plan reference.
- **Monetary-like fields (weight/rpe) use Prisma `Decimal`** to avoid
  floating-point drift. The backend serializes them to numbers in the JSON
  response; the zod schema uses `z.number()`.
- **Cascade deletes are intentionally asymmetric.** Deleting a `Plan` cascades
  to `Workout` and `PlanExercise`, but a `Session` references them with
  `Restrict` so historical data cannot disappear. If the user needs to free
  a plan name, archive is the path, not delete.

---

## 7. Backend Architecture (adapted from `backend-architecture.md`)

We keep the layering (composition root → factories → controllers → services
→ data). The framework boundary moves from Express to Next.js Route
Handlers. Diffs versus the reference architecture:

| Reference                      | fit-stack                                                     |
| ------------------------------ | ------------------------------------------------------------- |
| Express `app` + middlewares    | Next.js Route Handlers (`app/api/**/route.ts`)                |
| WorkOS auth middleware         | `withAuth()` HOF wrapping handlers, using `@supabase/ssr`     |
| `controllerRouteAdapter`       | `adaptRoute()` helper: parse `Request` with zod, map errors   |
| Nango / Firecrawl folders      | removed                                                       |
| CloudWatch transport           | stdout (Vercel captures); optional Sentry                     |
| Webhook routes                 | `app/api/public/share/[token]/` (token-auth, rate-limited)    |

### 7.1 Supabase auth wrapper

`src/server/middlewares/with-auth.ts` exports a HOF used by every authed
route handler:

```ts
export const withAuth =
  (handler: (req: NextRequest, ctx: { auth: Auth; params?: any }) => Promise<Response>) =>
  async (req: NextRequest, ctx: { params?: any }) => {
    const supabase = createServerClient(/* cookies from next/headers */);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ code: "UNAUTHENTICATED", message: "..." }, 401);
    return handler(req, { auth: { userId: user.id, email: user.email! }, params: ctx.params });
  };
```

Route handlers never re-check auth — they only check **ownership** by
passing `ctx.auth.userId` into the data layer. Server components that query
the data layer directly use the same `@supabase/ssr` client to derive the
user id before calling a data method.

### 7.2 Route grouping (file system)

- `app/api/<resource>/route.ts` — authed endpoints for the frontend. Each
  handler is wrapped in `withAuth(adaptRoute(schema, controller))`.
- `app/api/public/share/[token]/route.ts` — share-link read endpoints. No
  session cookie; validated by opaque token. Rate-limited per IP + token.
- `app/api/healthz/route.ts` — public health check.
- Admin user-provisioning is a CLI script under `src/server/scripts/`, not
  an HTTP route.

### 7.3 Route handler → controller adapter

`src/server/route-adapters/adapt-route.ts`:

```ts
export const adaptRoute =
  <S extends z.ZodTypeAny>(schema: S, controller: Controller<z.infer<S>>) =>
  async (req: NextRequest, ctx: { auth: Auth; params?: any }) => {
    const input = await parseRequest(schema, req, ctx.params);   // body/query/params
    const result = await controller.handle({ ...input, userId: ctx.auth.userId });
    return NextResponse.json(result.body, { status: result.statusCode });
  };
```

Controllers stay framework-agnostic: they accept a plain input object and
return `{ statusCode, body }`. This matches the reference pattern exactly —
only the glue changes.

### 7.4 Data layer

One file per aggregate root under `src/server/data/`. They accept a
`PrismaClient` in the constructor; for logs, import `log` from
`src/server/config/log.ts` rather than calling `console` directly. Example
method:

```ts
async getPlanForUser(planId: string, userId: string): Promise<Plan | null> {
  return this.prisma.plan.findFirst({ where: { id: planId, userId } });
}
```

**Never** fetch by id alone in a user-authenticated route. Always pair with
`userId` to enforce ownership.

### 7.5 Session creation (multi-row insert)

`POST /api/sessions` body: `{ planId, workoutId }`. The controller:

1. Asserts the workout belongs to the plan and the plan belongs to the user.
2. Loads the workout with its `planExercises` + `planSets`.
3. In a `prisma.$transaction`, creates a `Session`, then `SessionExercise`
   rows keyed by `planExerciseId`, then `SessionSet` rows cloned from
   `PlanSet` (with empty `reps`/`weight`).
4. Returns the full session with nested exercises and sets.

Updates to sets (`PATCH /api/session-sets/[id]`) are single-row updates with
ownership enforced via a join: `where: { id, sessionExercise: { session: { userId } } }`.

### 7.6 Server components may call the data layer directly

Read-heavy screens (calendar, dashboard tiles, share pages) can import
`src/server/data/*` from a server component and skip the HTTP round-trip.
Writes go through route handlers so the zod-at-the-edge contract stays
consistent. This is a deliberate asymmetry: reads are cheap; writes benefit
from a single validated entry point.

### 7.7 Controllers checklist (per `backend-architecture.md` §6)

Every resource follows the same build order: zod schema → data class →
controller → factory → route handler. The only Next.js-specific step is
the last one: instead of mounting an Express sub-router, you drop a
`route.ts` file under `app/api/<resource>/`.

---

## 8. Frontend Architecture (Next.js)

### 8.1 Auth and session

- `@supabase/ssr` stores the session in HTTP-only cookies.
- Server components read the session via `createServerClient()` and pass the
  access token to the API client.
- Client components use `createBrowserClient()`; a small `useSession()` hook
  exposes the user and refreshes on `onAuthStateChange`.
- Logged-out users visiting `(app)/*` are redirected in `middleware.ts`.

### 8.2 API client

`src/lib/api-client.ts` exports a typed `api` object for **client
components only**. Server components should import the data layer directly
(see §7.6) instead of fetching their own API over HTTP.

```ts
// client component
import { api } from "@/lib/api-client";
await api.sessions.createSet(sessionSetId, { reps: 8, weight: 80 });
```

Because the API is same-origin, the Supabase session cookie is sent
automatically — no bearer-token plumbing on the client. Methods are
organised by resource and return `z.infer` types from `src/lib/schemas`.
Errors are normalised to `{ status, code, message, issues? }`.

### 8.3 Form hook

```ts
// src/lib/hooks/use-zod-form.ts
export function useZodForm<TSchema extends z.ZodType>(args: {
  schema: TSchema;
  defaultValues?: DeepPartial<z.infer<TSchema>>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
}) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(args.schema),
    defaultValues: args.defaultValues,
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await args.onSubmit(values);
    } catch (err) {
      // map API issues into RHF errors where possible, toast otherwise
      mapApiErrorToForm(err, form);
      showErrorToast(err);
    }
  });

  return { ...form, submit };
}
```

A matching `<Field />` component wraps HeroUI inputs, reading error state
from `useFormContext()`. This keeps pages terse:

```tsx
<FormRoot form={form}>
  <Field name="name" label="Plan name" />
  <Field name="description" label="Description" as="textarea" />
  <SubmitButton>Create</SubmitButton>
</FormRoot>
```

### 8.4 Key screens

- **Login** — single email/password form; on success, cookie session is set
  and the user is routed to `/plans`.
- **Plans list + detail** — cards for each plan; one plan has an "active"
  badge. Detail page lists workouts and lets the user drag-reorder them.
- **Workout editor** — inline exercises with per-exercise collapsible set
  editors. Add via `ExercisePicker` (catalog + user-created search).
- **Active session (`/sessions/[id]`)** — mobile-first. Each exercise is a
  card; tap a set to flip into an input mode (reps, weight, rpe); tap-done
  marks `completed`. "Finish workout" sets `finishedAt`.
- **Calendar** — month view; dots per session day; tap a day to see
  sessions; tap a session to re-open its detail (read-only summary).
- **Dashboard** — tiles:
  - Sessions this week / month (bar)
  - Volume per week (line)
  - Per-exercise top set progression (line, filterable)
  - Recent PRs (list)
  - Body-weight trend from progress photos (line)
- **Photos** — weekly gallery grouped by `weekStartDate`; upload modal
  capturing `takenAt`, `bodyWeightKg`, `notes`.
- **Share** — `/settings/share`: create link, pick scope, expiry; list of
  active links with copy + revoke.
- **Public share (`/share/[token]`)** — no chrome, read-only view scoped by
  `ShareScope`. 404s on revoked/expired.

### 8.5 Styling

- Tailwind v4 (or v3 if HeroUI still requires v3 at the time of install —
  check the HeroUI compatibility matrix before locking the version).
- A single `theme.ts` with Tailwind tokens aligned to HeroUI's theme; do not
  hard-code colors in components.
- Dark mode: class-based, default to system.

---

## 9. Cross-cutting Concerns

### 9.1 Validation

- Every external boundary (API body/query/params, form submit, env) is
  parsed with zod. Internal functions receive already-typed values.
- Shared schemas live in `src/lib/schemas/`. Names are aggregate-scoped:
  `CreatePlanInput`, `UpdatePlanInput`, `PlanDTO`, etc.

### 9.2 Error handling

Backend: `adaptRoute` centralises the route-boundary error path. We extend
it with:

- A typed `AppError` class with `statusCode`, `code`, `message`.
- A mapper: Prisma's `P2025` (record not found) → 404, `P2002` (unique) → 409.
- JSON error shape: `{ code: string; message: string; issues?: ZodIssue[] }`.
- A top-level catch in the adapter converts unknown errors to 500 with a
  request id; Next.js `error.tsx` handles the server-component path.

Frontend: `api-client` normalises to the same shape. `useZodForm`'s
`mapApiErrorToForm` turns `issues[]` into per-field RHF errors; other errors
become toasts.

### 9.3 Observability

- **Request ID**: generated inside `adaptRoute`; echoed back in
  `x-request-id` response header; passed into `log.info/warn/error` calls
  via the `fields` argument (e.g. `log.info("plan.create", { requestId, userId })`).
- **Sentry**: initialised via Next.js `instrumentation.ts` (server) and
  `sentry.client.config.ts` (browser). DSNs optional.
- **Health**: `GET /api/healthz` returns `{ ok: true, version }`.

### 9.4 Security

- Same-origin API: no CORS config needed. If we ever expose `/api/*` to a
  third party, switch on an explicit allow-list then — don't open it up
  preemptively.
- Security headers via `next.config.ts` `headers()` (CSP, Referrer-Policy,
  X-Frame-Options, Strict-Transport-Security).
- Rate limit on:
  - `POST /api/auth/*` (defense against credential stuffing — Supabase
    terminates auth, but we still gate the login page).
  - `GET /api/public/share/*` (per-IP + per-token).
  - `POST /api/photos/presign` (per-user).
  - Use an edge-friendly limiter (Upstash Redis) so it works on both Node
    and Edge runtimes if we mix them.
- S3 presigned PUTs constrained by `Content-Length` range and
  `Content-Type` header, TTL ≤ 5 min.
- No secrets in logs. Never log the raw `Request`, `headers`, or request
  body — pick explicit fields. `log.ts` runs every `fields` object through
  a `redact()` helper that strips `authorization`, `cookie`, `password`,
  `token`, and `aws*` keys before serialising.
- **CSRF**: because the API lives at the same origin as the app and the
  Supabase session is a cookie, we enforce CSRF on state-changing handlers:
  require either a `content-type: application/json` body (browsers won't
  send that cross-origin without CORS preflight) **or** a custom
  `x-requested-with: fit-stack` header set by the API client. Rejections
  return 403. Reads are idempotent and exempt.

### 9.5 Ownership and authorization

Every Prisma query either:

- Filters by `userId = req.auth.userId` on the user-facing root, or
- Joins through a relation that ultimately reaches `user: { id: userId }`.

No exceptions. This is reviewed in every PR that touches `data/*`.

### 9.6 Migrations discipline

- Local dev: `npx prisma migrate dev` creates migrations.
- CI: `npx prisma migrate deploy` on release branch.
- Prod: run `migrate deploy` in a Vercel build/deploy hook **before** the
  new revision serves traffic. The standard path is a `prebuild` script
  (`prisma migrate deploy && prisma generate`) so every Vercel build
  applies pending migrations against the linked Supabase database.
- Never edit an applied migration; create a follow-up.

---

## 10. Infrastructure and Deployment

### 10.1 Services

| Service   | Where                | Notes                                                                                              |
| --------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| Postgres  | Supabase             | Free/Pro tier; we also get Supabase Auth here.                                                     |
| S3 bucket | AWS                  | Private bucket; the app signs URLs. Lifecycle rule to move old photos to IA after 90d (optional).  |
| App       | Vercel               | Single Next.js project. `prebuild` script runs `prisma migrate deploy`.                            |
| DNS       | Vercel custom domain | e.g. `fit.example.com`.                                                                            |

Vercel-specific notes:

- One project. Env vars set per environment (Preview / Production) in the
  Vercel dashboard; `.env.local` covers local dev.
- Long-running handlers (e.g. S3 multipart upload fallback, if ever
  needed) must stay under the serverless function timeout — today all
  routes are short, so default timeouts are fine. Force Node runtime
  (`export const runtime = "nodejs"`) on any route that imports Prisma.
- Preview deployments per PR are free validation; they share the staging
  Supabase project.

### 10.2 Build

No Dockerfiles. Vercel's default Next.js build handles it. We add:

- `"prebuild": "prisma generate && prisma migrate deploy"` in `package.json`.
- `prisma` `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for Vercel's
  Amazon Linux runtime (replaces the earlier `debian-openssl-3.0.x` note).

### 10.3 CI (GitHub Actions)

On every PR:

- `npm run lint`
- `npm run typecheck`
- `npm run build` (smoke — Vercel will rebuild on deploy anyway)

No test step in v1 (see §2 non-goals). Deploys happen via the Vercel
GitHub integration; no CI push step needed.

---

## 11. Phased Implementation Plan

Each phase is a vertical slice: DB + backend + frontend + tests, so we
always have a working product. Exit criteria are literal.

---

### Phase 0 — Repo scaffolding (0.5 day)

**Goal:** green CI on an empty repo with the right layout.

**Deliverables**

- `package.json`, `.nvmrc` pinned to `20.18.0` (Node 20 LTS), `.gitignore`,
  `package-lock.json`.
- `next create` scaffold at the repo root (App Router, TS, Tailwind, ESLint).
- `prisma/` folder with empty `schema.prisma`; `@prisma/client` installed.
- `src/lib/schemas/` and `src/server/` skeleton directories.
- ESLint + Prettier; scripts: `dev`, `lint`, `typecheck`, `build`,
  `seed:user`, `seed:catalog`.
- `.env.example` at the repo root.
- `"engines": { "node": "20.x" }` in `package.json` so Vercel matches.

**Exit criteria**

- `npm install && npm run typecheck && npm run build` passes on a fresh clone.

**Risks / pitfalls**

- HeroUI version ↔ Tailwind version mismatch — resolve this at the moment
  we add HeroUI (Phase 1).
- Prisma binary targets for Vercel (`rhel-openssl-3.0.x`); set now to avoid
  surprises later.
- `src/server/*` must not be imported from client components. Add an
  ESLint rule (`no-restricted-imports`) and `import "server-only"` at the
  top of each server file.

---

### Phase 1 — Auth + app shell (1–1.5 days)

**Goal:** a deployed stack where an admin-provisioned user can log in,
land on an empty authed home page, and log out. Nothing else works yet.

**Backend**

- `src/server/config/{env,log,prisma,supabase}.ts`.
- `src/server/middlewares/with-auth.ts`.
- `Profile` Prisma model + migration.
- `GET /api/me` route handler returning the profile.
- `src/server/scripts/seed-user.ts` CLI (run via `tsx`) that:
  - calls Supabase Admin API to create a user (email + password from argv),
  - inserts the matching `Profile` row.

**Frontend**

- HeroUI + Tailwind installed; basic theme.
- `(auth)/login` page with `useZodForm`.
- Supabase browser + server clients; `middleware.ts` that protects `(app)/*`.
- Empty `(app)/page.tsx` landing after login.
- Toast provider wired up.

**Exit criteria**

- `npm run seed:user -- --email you@example.com --password '…'` provisions
  a user end-to-end (auth.users + public.profiles).
- User can log in at `http://localhost:3000/login`, be redirected, see their
  name from `/api/me`, and log out.
- Deploy a Vercel preview; same flow works over the preview domain.

---

### Phase 2 — Plans and workouts (2–3 days)

**Backend**

- Prisma models: `Plan`, `Workout`, `Exercise`, `PlanExercise`, `PlanSet`,
  enum `SetType`. Migration.
- Seed a small exercise catalog (barbell/ dumbbell staples) with
  `ownerId = null`.
- Controllers + route handlers (all authed via `withAuth`):
  - `POST/GET/PATCH/DELETE /api/plans`, `POST /api/plans/[id]/activate`.
  - `POST/GET/PATCH/DELETE /api/plans/[planId]/workouts`.
  - `GET/POST /api/exercises`, `POST /api/exercises/search`.
  - Nested set/exercise mutations under the workout.
- Authorisation: always filter by `ctx.auth.userId`; add `assertOwnsPlan()`
  helper used by nested writes.

**Frontend**

- `/plans` list, `/plans/[id]` editor.
- Exercise picker modal (catalog search + "create custom").
- Inline set editor with `SetType` dropdown; optimistic updates.
- Zod schemas in `src/lib/schemas/plan.ts` reused by route handlers and
  the form hook.

**Exit criteria**

- User can build a plan end-to-end in the UI, see it persisted, mark it
  active, and archive old plans.
- Manual check: logging in as a second seeded user and hitting another
  user's plan id via the API returns 404.

---

### Phase 3 — Gym sessions (2–3 days)

**Backend**

- Prisma models: `Session`, `SessionExercise`, `SessionSet`. Migration.
- `POST /api/sessions` clones the workout template in a transaction (see §7.5).
- `GET /api/sessions/[id]`, `PATCH /api/session-sets/[id]`,
  `POST /api/sessions/[id]/finish`,
  `POST /api/session-exercises/[id]/sets` (add ad-hoc set),
  `DELETE /api/session-sets/[id]`.
- `GET /api/sessions?from=&to=` for calendar.

**Frontend**

- "Start session" picker: pick plan (defaults to active) → pick workout.
- Active session screen (mobile-first); per-set completion with generous
  tap targets; no modals for logging.
- "Finish workout" CTA summarising volume and duration.

**Exit criteria**

- Running the app on a phone in the gym: user can log a whole workout
  without the experience getting in the way (manual test).
- Manual path: login → start session → log 3 sets → finish session → the
  session appears on the list on the next reload.

---

### Phase 4 — Calendar (0.5–1 day)

**Frontend**

- Month view (consider `@heroui/calendar` if it has month mode, else build
  on `date-fns` + a simple grid).
- Day drill-down modal or subroute listing that day's sessions.
- Read-only session summary page.

**Backend**

- None new (reuses `GET /api/sessions?from=&to=`).

**Exit criteria**

- Past sessions appear in the calendar on the correct local date.

**Gotcha**

- Time zones: store UTC; render in the user's browser timezone. Be explicit
  in the API response (ISO 8601) and in UI (`date-fns-tz`).

---

### Phase 5 — Dashboard + charts (1.5–2 days)

**Backend**

- New `dashboard-data.ts` with aggregation queries:
  - sessions per ISO-week for last N weeks,
  - total volume per ISO-week (`sum(reps * weight)` for working sets),
  - per-exercise max weight by date,
  - per-exercise estimated 1RM by date (Epley formula: `w * (1 + r/30)`),
  - body-weight series from `progress_photos`.
- Controller `dashboard-controller.ts` with endpoints like
  `GET /api/dashboard/volume?weeks=12`,
  `GET /api/dashboard/exercise/[id]/progression`,
  `GET /api/dashboard/prs?limit=5`.
- Careful: aggregation must filter by `userId`. Double-check each query
  against a seeded dataset manually before shipping.

**Frontend**

- Install `recharts`; build chart primitives in `components/charts/`.
- Dashboard page composed of tiles calling each endpoint.
- Empty-state cards when data is sparse.

**Exit criteria**

- With ≥2 weeks of logged sessions, all tiles render without error.
- Charts gracefully show "not enough data yet" when series has <2 points.

---

### Phase 6 — Progress photos (1–1.5 days)

**Backend**

- `ProgressPhoto` model + migration.
- `src/server/config/s3.ts` singleton `S3Client`.
- `POST /api/photos/presign` body `{ contentType, bytes, takenAt, weekStartDate }`
  → returns `{ uploadUrl, s3Key, headers }`. Enforces:
  - `contentType in ['image/jpeg', 'image/png', 'image/webp']`,
  - `bytes <= 10_000_000`,
  - key namespaced `photos/<userId>/<uuid>.<ext>`.
- `POST /api/photos/confirm` body `{ s3Key, ... }` inserts the DB row after
  the client has PUT the object.
- `GET /api/photos?from=&to=` returns rows with **presigned GET URLs**
  (short TTL, e.g. 5 min) — do not store URLs in the DB.
- `DELETE /api/photos/[id]` soft-deletes the row and deletes the S3 object.

**Frontend**

- `/photos`: weekly gallery.
- Upload flow: pick file → request presign → `fetch(PUT)` → `POST confirm` →
  optimistic insert in the list.
- Weekly grouping keyed by `weekStartDate` (Monday).

**Exit criteria**

- Upload, view, delete works locally against a real (test) S3 bucket.
- Direct S3 access without a presigned URL returns 403 (sanity check).

**Gotchas**

- Client-side image resizing before upload improves UX on slow networks —
  use `browser-image-compression` or a canvas resize. Keep original orientation
  by reading EXIF (`exifr`) if we care about portrait photos.
- Don't render photos from S3 via a public bucket; always re-sign.

---

### Phase 7 — Share links (0.5–1 day)

**Backend**

- `ShareLink` model + migration.
- Authed: `POST/GET/DELETE /api/share-links`. Tokens are 32-byte base64url.
- Public: `app/api/public/share/[token]/route.ts`:
  - `GET` returns a payload scoped by `ShareScope`.
  - 404 if revoked or expired.
  - IP + token rate-limited.

**Frontend**

- `/settings/share`: create link (select scope + optional expiry), copy,
  revoke.
- `/share/[token]`: minimal chrome, read-only view. Server component
  fetches with no auth header, handles 404 state.

**Exit criteria**

- Link works in a private browser window.
- Revoking makes the link 404 on next request.

---

### Phase 8 — Production readiness and deploy (1 day)

**Deliverables**

- Sentry wired (optional DSNs).
- Structured logs verified on Vercel.
- Health check `/api/healthz` wired up and monitored (Vercel or external).
- Vercel project settings documented in `README.md` (env vars, domain,
  `prebuild` hook).
- `prisma migrate deploy` in the `prebuild` script so every production
  deploy applies pending migrations before the new revision goes live.
- Run a live smoke test: login → create plan → log session → upload photo →
  view share link.

**Exit criteria**

- Fresh Vercel deploy goes from zero to usable in under 15 min following
  `README.md`.
- A basic runbook in `docs/runbook.md` covers: rotate secrets, provision a
  new user, roll back a migration, check Sentry.

---

## 12. Risks and Open Questions

1. **HeroUI/Tailwind version pin** — resolve at Phase 1 install time.
2. **Supabase JWT algorithm** — default is HS256 with `SUPABASE_JWT_SECRET`;
   some projects switch to RS256 + JWKS. Pick one early and stick with it.
3. **Prisma on Vercel serverless** — route handlers run as serverless
   functions, so we must use Supabase's pooled connection (`DATABASE_URL`
   on port 6543 with `pgbouncer=true&connection_limit=1`) and the direct
   URL (`DIRECT_URL` on 5432) only for migrations. Force `runtime = "nodejs"`
   on any route importing Prisma — it does not run on Edge.
4. **Mobile install vs mobile web** — the "at-the-gym" UX will be tested on
   mobile web. If friction surfaces, a PWA manifest is a cheap upgrade that
   gets an install prompt and offline shell.
5. **Exercise catalog seeding** — start small (~30 core exercises). Plan a
   second migration to extend later; the app must handle custom exercises
   from day one so this is not blocking.
6. **Decimal serialisation** — Prisma Decimal → JSON. Choose a single
   strategy (`toNumber()` at the data layer boundary) and document it; do
   not let `Decimal` objects leak to the controller response.
7. **Share-link privacy** — public pages should include `noindex` headers
   and robots.txt entry so we don't accidentally indexed by search engines.

## 13. Appendix

### 13.1 Useful commands (target state)

```bash
# bootstrap
npm install

# dev
npm run dev

# database
npx prisma migrate dev
npx prisma studio
npm run seed:user -- --email ... --password ...
npm run seed:catalog

# build
npm run build
```

### 13.2 Naming conventions

- Files: `kebab-case.ts`. Folders: `kebab-case`.
- Types: `PascalCase`. Variables/functions: `camelCase`.
- Env vars: `SCREAMING_SNAKE_CASE`.
- Prisma models in `PascalCase`, tables in `snake_case` via `@@map`.
- Routes: `/kebab-case/resource` with plural nouns.

### 13.3 Commit conventions

Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`,
`test:`). One logical change per commit; phases map to roughly 3–10 commits.

### 13.4 Reference checklist when adding a new resource

Follow `backend-architecture.md` §6 verbatim, adapted to Next.js:

1. zod schemas → `src/lib/schemas/<resource>.ts` (shared client + server).
2. Prisma model (if new) → `prisma/schema.prisma` + migration.
3. `src/server/data/<resource>-data.ts`.
4. `src/server/presentation/controllers/<resource>-controller.ts`.
5. `src/server/factories/<resource>-factory.ts`.
6. `app/api/<resource>/route.ts` (and `[id]/route.ts` for single-item ops)
   wrapping the controller in `withAuth(adaptRoute(...))`.
7. Frontend API client method in `src/lib/api-client.ts` + page/components.

---

**End of plan.** Phases 0 and 1 are the highest-signal starting points;
any further change to the stack (e.g. splitting the API back out into a
standalone service) is easiest before Phase 2 ships.
