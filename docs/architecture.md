# HAPPI architecture

## Runtime shape

```text
Browser
  |-- apps/web      Client + therapist experience (Next.js)
  |-- apps/admin    Operations experience (React + Vite)
  `-- apps/api      Product and integration boundary (NestJS)
          |-- PostgreSQL  durable transactional data
          `-- Redis       cache, distributed coordination, and future jobs
```

Both frontends consume `@happi/ui`, `@happi/fonts`, and the other shared packages. They do not share app-specific pages or business workflows.

## Application boundaries

- `apps/web` serves public discovery plus authenticated client and therapist journeys.
- `apps/web` exposes a thin `/api/*` backend-for-frontend proxy to the NestJS API; browser code never needs the API's private service address.
- `apps/admin` is separately deployed and restricted to HAPPI operations staff.
- `apps/api` owns authorization, business rules, persistence, payments, session access, auditability, and provider integrations.
- A future `apps/worker` can consume the same packages when reminders, email delivery, payment reconciliation, and payouts move to BullMQ jobs.

## Data infrastructure

HAPPI's data infrastructure is designed around the following responsibilities:

- PostgreSQL 15 is the system of record.
- TypeORM migrations are the only production schema-change mechanism; `synchronize` stays disabled.
- Redis 7 is available for ephemeral data and background-job infrastructure. It must not become the source of truth for bookings, payments, earnings, or session completion.
- Local infrastructure is isolated in `docker-compose.dev.yml` with HAPPI-specific databases and volumes.
- The shared development environment uses Railway private networking and service reference variables; credentials never belong in the repository.

Initial aggregate/module boundaries mirror the PRD: auth, clients, therapists, verification, availability, bookings, payments, payouts, wallet, sessions, notifications, admin, and safety.

## Shared UI and typography

`@happi/ui` is the single component and design-token library for web and admin. Reusable primitives belong there; product-specific composites stay in their owning app until reuse is proven.

The prototype typography is self-hosted through `@happi/fonts`:

- Fraunces Variable for titles and display headings.
- DM Sans Variable for body copy and interface controls.
- The Lovable camera/debug font is intentionally excluded.

The shared palette follows the prototype's warm off-white, cream, sand, deep-green, and muted green-gray foundation. The approved brand anchors are `#194e33` (primary) and `#dc7a44` (secondary).

## Sensitive-data rules

- Share DTOs, enums, and validation contracts; never export TypeORM entities to a frontend.
- Store professional documents outside the database in private object storage and persist only protected metadata/references.
- Store payment-provider references, not raw card data.
- Treat booking, session, identity, credential, and safety data as sensitive and audit privileged access.
- Do not record sessions unless product, legal, consent, storage, retention, and access rules are explicitly approved.

## Decisions intentionally deferred

The skeleton creates boundaries without prematurely selecting:

- authentication and identity provider;
- Adyen payment/payout topology;
- video/voice provider;
- email provider;
- object storage provider;
- credential verification provider;
- whether live-session chat or recording belongs in the MVP;
- the exact rule that makes a session eligible for therapist earnings.
