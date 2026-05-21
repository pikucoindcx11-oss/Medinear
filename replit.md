# MediNear

A production-ready medical appointment web app to find nearby medicine shops, book doctor appointments, and manage lab tests.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (Tailwind CSS v4, shadcn/ui, wouter, TanStack Query)
- API: Express 5 (port 8080, mounted at `/api`)
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit OIDC (openid-client) + custom session store in Postgres
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/medinear/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express 5 API server (served at `/api`)
- `lib/db/src/schema/` — Drizzle ORM schemas (shops, doctors, appointments, lab_tests, reviews, auth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validation schemas
- `lib/replit-auth-web/src/` — Frontend `useAuth()` hook for Replit OIDC

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval generates both React Query hooks (client) and Zod schemas (server)
- Replit OIDC auth with cookie-based sessions stored in PostgreSQL
- Vite aliases `@workspace/replit-auth-web` and `@workspace/api-client-react` to source for HMR
- Token numbers auto-generated per doctor per date for appointment queuing
- Admin panel uses `isAdmin` flag on the users table; set manually in DB for now

## Product

- **Home**: Search bar, quick action cards, specialty grid, nearby shops & popular doctors
- **Medicine Shops**: Browse all shops with Open/Closed filter, address, hours, ratings
- **Shop Detail**: Shop info, doctors available at that shop, reviews
- **Doctors**: Search & filter by specialization, ratings, consultation fee
- **Doctor Detail**: Full profile, book appointment CTA, patient reviews
- **Appointments**: View/cancel my appointments, token numbers, status tracking
- **Book Appointment**: Select doctor, shop, date, time slot
- **Lab Tests**: View/cancel my lab tests
- **Book Lab Test**: Book with category, shop, date, price
- **Admin Panel**: Dashboard stats, manage shops/doctors, update appointment & lab test statuses
- **Dark/Light Mode**: Persistent theme toggle
- **Mobile-responsive**: Bottom navigation on mobile, top nav on desktop

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Vite `fs.strict: false` required so Vite can serve files from `lib/` workspace packages
- API route imports must use generated Zod schema names (`CreateShopBody`, not `ShopInput`)
- `zod` must be listed as a direct dependency in `api-server/package.json` (not just in api-zod)
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Seed data SQL in `/tmp/seed.sql` — re-run after DB wipes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- DB schema: `lib/db/src/schema/`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Theme: CSS variables in `artifacts/medinear/src/index.css` (teal/medical palette)
