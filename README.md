# HAPPI

Mental healthcare that understands where you come from, wherever you are.

HAPPI is a culturally relevant mental-health platform connecting Africans at home and abroad with qualified professionals. This repository currently contains the Web MVP foundation: project structure, shared contracts and UI, and local infrastructure. Product features are intentionally not implemented in this initial scaffold.

## Monorepo

HAPPI is a pnpm workspace orchestrated by Turborepo.

```text
apps/
  web/             Next.js client + therapist experience
  admin/           React/Vite operations dashboard
  api/             NestJS API
packages/
  ui/              Shared Radix-compatible components and design tokens
  fonts/           Shared DM Sans and Fraunces font setup
  config/          Product constants
  types/           Public TypeScript contracts (never database entities)
  validation/      Shared Zod input schemas
  utils/           Framework-independent helpers
  eslint-config/   Shared lint rules
  tsconfig/        Shared TypeScript configuration
tooling/scripts/   Future repository automation
docs/              Architecture and engineering decisions
```

The public web app and admin dashboard both consume `@happi/ui`. Fraunces is the shared title/display face and DM Sans is the shared body/interface face, matching the approved prototype direction.

Shared application chrome is exposed as framework-neutral `AuthShell` and `DashboardShell` components from `@happi/ui`. Apps provide their own navigation, authentication state, routing, and role-specific content through shell slots.

## Technology

- pnpm + Turborepo
- Next.js for the client and therapist web experience
- React + Vite for admin operations
- NestJS for the API
- Next.js server-side API proxy for the web backend-for-frontend boundary
- PostgreSQL 15 + TypeORM for durable data
- Redis 7 for cache, coordination, and future BullMQ-backed work
- TypeScript, Zod, Tailwind CSS, Radix primitives, and shared design tokens

The PostgreSQL/TypeORM and Redis setup follows the local infrastructure approach already used by Lumeo's `oss-server`, with HAPPI-specific names and isolated volumes.

## Prerequisites

- Node.js 22.12 or newer (`nvm use` uses the repository version)
- pnpm 11.24 or newer through Corepack
- Docker Desktop or compatible Docker Engine for local PostgreSQL and Redis

## Local setup

```bash
nvm use
corepack enable
pnpm install
cp .env.example .env.development.local
pnpm services:up
pnpm --filter @happi/api migration:run:local
pnpm dev:local
```

Local services:

| Service    | URL / port                            | Purpose                       |
| ---------- | ------------------------------------- | ----------------------------- |
| Web        | `http://localhost:3000`               | Client and therapist journeys |
| Admin      | `http://localhost:5173`               | HAPPI operations              |
| API        | `http://localhost:4000/api/v1`        | Backend API                   |
| Health     | `http://localhost:4000/api/v1/health` | API liveness                  |
| PostgreSQL | `localhost:5432`                      | `happi_dev` database          |
| Redis      | `localhost:6379`                      | Ephemeral infrastructure      |

Browser requests from the web app should use `/api/*`. The Next.js catch-all proxy forwards them to `API_INTERNAL_URL`, which defaults locally to `http://localhost:4000/api/v1`. The upstream URL remains server-only and must never use a `NEXT_PUBLIC_` prefix.

The auth module boundary is mounted at `/api/v1/auth`, and is reachable from the web app through `/api/auth`. Authentication behavior and endpoints will be implemented separately.

The committed environment examples contain local-only placeholders. Never commit real credentials or production secrets.

## Shared development environment

The shared development environment is designed for Railway with private PostgreSQL and Redis services. The API supports Railway's injected `PORT`, production-built TypeORM migrations, and the `/api/v1/health` deployment health check.

Follow the [Railway development guide](docs/railway-development.md) for the API variable checklist. Database and Redis credentials must be attached through Railway reference variables rather than copied into this repository.

## Common commands

```bash
pnpm dev             # run all apps
pnpm dev:local       # run all apps against local Docker services
pnpm dev:web         # web only
pnpm dev:admin       # admin only
pnpm dev:api         # API only
pnpm check           # lint, typecheck, test, and build
pnpm format          # format the repository
pnpm services:up     # start PostgreSQL and Redis
pnpm services:down   # stop local infrastructure
```

Database migrations are explicit because TypeORM schema synchronization is disabled:

```bash
pnpm --filter @happi/api migration:create -- src/database/migrations/name
pnpm --filter @happi/api migration:generate
pnpm --filter @happi/api migration:show
pnpm --filter @happi/api migration:run
pnpm --filter @happi/api migration:run:local
pnpm --filter @happi/api migration:revert
```

## MVP boundaries

The API has module boundaries for the commercial care journey:

```text
Discover -> Compare -> Choose -> Book -> Pay -> Connect -> Complete
```

This covers auth, clients, therapists, verification, availability, bookings, payments, payouts, wallet, sessions, notifications, admin operations, and safety. The 10% HAPPI commission and NGN/USD support are represented as shared product constants/contracts, not yet as implemented business logic.

Provider-specific choices remain deferred until their requirements are agreed: identity/authentication, Adyen payment and payout design, video/voice, email, document storage, credential verification, session recording, and chat.

See [the architecture notes](docs/architecture.md) for boundaries, data decisions, sensitive-data rules, and deferred decisions.

## Development principles

- Put deployable software in `apps/` and reusable code in `packages/`.
- Add reusable visual primitives to `@happi/ui`; keep feature workflows in their owning app.
- Share public contracts and validation, not database entities, with frontends.
- Use database migrations for every schema change.
- Keep money in integer minor units and store an explicit ISO currency.
- Make booking, payment, session-completion, earnings, and payout transitions auditable.
- Minimize sensitive mental-health data and enforce role-based access at the API boundary.
