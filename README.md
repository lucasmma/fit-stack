# fit-stack

Personal fitness tracker: plans → workouts → exercises → sets → gym sessions,
with a calendar, dashboard, weekly progress photos, and revocable public share
links.

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
app/                    # Next.js App Router
├── (auth)/login/       # public login
├── (app)/              # authed routes: plans, sessions, calendar, dashboard, photos, settings
├── share/[token]/      # public read-only share view
└── api/                # route handlers grouped by resource
components/
├── ui/                 # atomic UI primitives (PageHeader, EmptyState, StatTile, ConfirmDialog, …)
├── forms/              # Field, FormRoot, SubmitButton
├── charts/             # chart primitives (ChartCard, LineSeriesChart, BarSeriesChart, …)
├── features/           # feature components (plans/, sessions/, calendar/, dashboard/, photos/, share/)
└── shell/              # app shell: Sidebar, MobileNav, UserMenu, NavLink, …
src/
├── lib/                # runtime-free utilities, schemas, hooks, api client
│   ├── schemas/        # zod schemas shared server + client
│   ├── hooks/          # useZodForm, …
│   ├── supabase/       # browser + server + middleware clients
│   ├── utils/          # decimal, format, week-start, cn
│   └── api-client.ts   # typed fetch wrapper (client components)
└── server/             # server-only code (mark with `import "server-only"`)
    ├── config/         # env, log, prisma, supabase-admin, s3
    ├── middlewares/    # withAuth (Supabase session guard)
    ├── route-adapters/ # adaptRoute (zod + error mapping for Next route handlers)
    ├── presentation/   # controllers, protocols, helpers (framework-agnostic)
    ├── services/       # s3-upload
    ├── data/           # repositories — one per aggregate
    ├── factories/      # wire controllers with their deps
    └── scripts/        # seed-user CLI
prisma/
├── schema.prisma       # full target schema
└── seed.ts             # catalog seed (exercises)
```

See `docs/implementation-plan.md` for design rationale and phased build plan.

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
  `content-type: application/json` or `x-requested-with: fit-stack`.
- Every Prisma query filters by `userId` (or joins through a relation that
  reaches `userId`). RLS is bypassed by the service-role client, so
  authorization is enforced in the data layer.
- S3 is private; presigned PUT/GET URLs with ≤5 min TTL.
- Share links are opaque 32-byte base64url tokens. Revocation flips
  `revokedAt`; public endpoints 404 on revoked/expired links. `/share/*` and
  `/api/public/*` carry `X-Robots-Tag: noindex`.
