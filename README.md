# personal-hq

A single Next.js app that hosts multiple personal modules. The first module is
fitness tracking — plans → workouts → exercises → sets → gym sessions, with a
calendar, dashboard, weekly progress photos, and revocable public share links.
More modules (bills, etc.) can be added under the same shell; see
[`docs/architecture.md`](docs/architecture.md) for module conventions.

Built as a single Next.js app (App Router), deployed on Vercel, against
Supabase Postgres + S3 for photos.

## Stack

- **App**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: HeroUI + Tailwind CSS, Recharts, Sonner toasts
- **Forms**: React Hook Form + Zod (shared schemas in `src/lib/schemas/`)
- **Auth**: Supabase Auth (email/password, admin-provisioned users)
- **DB**: Prisma ORM against Supabase Postgres
- **Storage**: AWS S3 with presigned uploads for progress photos

## Repository layout

```
app/                              # Next.js App Router
├── (auth)/login/                 # public login
├── (app)/                        # authed shell (Sidebar + MobileNav)
│   ├── page.tsx                  # module launcher (one card per module)
│   └── fitness/                  # fitness module — UI routes
├── api/
│   ├── auth/, me/, healthz/      # cross-cutting auth + account endpoints
│   ├── public/share/[token]/     # public read-only share endpoint
│   └── fitness/                  # fitness module — API routes
└── share/[token]/                # public read-only share view
components/
├── ui/                           # generic primitives (PageHeader, StatTile, …)
├── forms/                        # Field, FormRoot, SubmitButton
├── charts/                       # chart wrappers (ChartCard, LineSeriesChart, …)
├── shell/                        # Sidebar, MobileNav, UserMenu, NavItems, Logo
└── modules/
    └── fitness/                  # all fitness-domain components, by feature
src/
├── lib/
│   ├── api-client.ts             # typed fetch wrapper
│   ├── hooks/                    # useZodForm, …
│   ├── supabase/                 # browser + server + middleware clients
│   ├── utils/                    # decimal, format, week-start, cn
│   └── schemas/                  # Zod schemas
│       ├── shared/               # cross-module (profile, common enums)
│       └── fitness/              # fitness module schemas
└── server/
    ├── shared/                   # cross-cutting infra (no business logic)
    │   ├── config/               # env, prisma, supabase, s3, log
    │   ├── middlewares/          # withAuth
    │   ├── route-adapters/       # adaptRoute (Zod harness)
    │   ├── presentation/         # protocols + helpers
    │   ├── services/             # s3-upload, …
    │   └── scripts/              # seed-user CLI
    └── modules/
        ├── account/              # cross-module: profile / "me" endpoints
        └── fitness/              # fitness module server code
            ├── controllers/
            ├── data/
            └── factories/
prisma/
├── schema/                       # multi-file schema (Prisma 6+)
│   ├── schema.prisma             # generator + datasource only
│   ├── shared.prisma             # Profile, cross-module enums
│   └── fitness.prisma            # fitness models
└── migrations/                   # single migration history
```

See [`docs/architecture.md`](docs/architecture.md) for module conventions and the
checklist for adding a new module. See `docs/implementation-plan.md` for the
original (fitness-only) design rationale.

## Getting started

### 1. Install

```bash
nvm use            # pins Node 20 via .nvmrc
npm install
```

### 2. Configure environment

Copy `.env.example` → `.env.local` and fill in:

- **Supabase**: create a project → copy `URL`, `anon key`, and `service role key`.
  The service-role key is used only on the server for admin operations.
- **Postgres**: use Supabase's connection string for `DATABASE_URL`.
- **AWS S3**: create a private bucket; create an IAM user with
  `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on that bucket.

### 3. Apply migrations

```bash
npx prisma migrate dev --name init
npm run seed:catalog
```

### 4. Provision your first user

```bash
npm run seed:user -- --email you@example.com --password '...' --name 'Your Name'
```

This creates a Supabase auth user AND a matching `public.profiles` row.

### 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in, and go build your first plan.

## Scripts

| Script               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Next dev server                                          |
| `npm run build`      | Full build (runs `prisma generate && migrate deploy` first) |
| `npm run typecheck`  | `tsc --noEmit`                                           |
| `npm run lint`       | ESLint                                                   |
| `npm run seed:user`  | Admin-provision a user: `-- --email <e> --password <p>`  |
| `npm run seed:catalog` | Upsert the default exercise catalog                    |
| `npm run format`     | Prettier                                                 |

## Deploying (Vercel)

1. Create a Vercel project pointed at this repo.
2. Set env vars (from `.env.example`) for **Production** and **Preview**.
3. Vercel runs `npm run build`, which executes the `prebuild` script first:
   `prisma generate && prisma migrate deploy`. Pending migrations are applied
   against the linked Supabase database before the new revision goes live.
4. Add a custom domain (e.g. `fit.yourdomain.com`).

Runtime notes:

- Every route that touches Prisma declares `export const runtime = "nodejs"`.
  Prisma does not run on the Edge runtime.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, and `AWS_*` must never be
  prefixed `NEXT_PUBLIC_` — those leak into the client bundle.

## Security model

- API requests require a Supabase session cookie (set via `@supabase/ssr`).
- `withAuth` checks the session; `adaptRoute` enforces CSRF by requiring either
  `content-type: application/json` or `x-requested-with: personal-hq`.
- Every Prisma query filters by `userId` (or joins through a relation that
  reaches `userId`). RLS is bypassed by the service-role client, so
  authorization is enforced in the data layer.
- S3 is private; presigned PUT/GET URLs with ≤5 min TTL.
- Share links are opaque 32-byte base64url tokens. Revocation flips
  `revokedAt`; public endpoints 404 on revoked/expired links. `/share/*` and
  `/api/public/*` carry `X-Robots-Tag: noindex`.
