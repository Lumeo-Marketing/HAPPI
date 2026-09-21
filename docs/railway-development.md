# Railway development environment

This document configures the shared development environment. Local development continues to use `docker-compose.dev.yml` and `.env`.

## Topology

Create these services in one Railway project and development environment:

```text
HAPPI API --private--> Postgres
          `----------> Redis
     |
     `-- public Railway domain for web/admin API requests
```

Keep PostgreSQL and Redis private. Only the API needs a public domain.

## API service

Connect the HAPPI GitHub repository to a Railway service. Because this is a shared pnpm monorepo, retain the repository root as the service root so workspace packages remain available.

Configure the service commands:

```text
Build command:      pnpm --filter @happi/api build
Pre-deploy command: pnpm --filter @happi/api migration:run:prod
Start command:      pnpm --filter @happi/api start
Healthcheck path:   /api/v1/health
```

The API reads Railway's injected `PORT` and listens on `0.0.0.0`.

Suggested watch paths:

```text
/apps/api/**
/packages/config/**
/packages/types/**
/packages/validation/**
/package.json
/pnpm-lock.yaml
/pnpm-workspace.yaml
```

## Variables

In the API service's Variables tab, use Railway reference variables rather than copying database credentials:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

The names `Postgres` and `Redis` must match the actual Railway service names. Railway's editor offers autocomplete for references.

Copy the remaining safe variable names from `.env.railway.example`. Generate unique values for `JWT_SECRET` and `ENCRYPTION_KEY`, then seal sensitive variables in Railway. Set `WEB_URL` and `ADMIN_URL` to the exact public development origins before authentication is enabled.

Do not copy database-service-only values such as `PGDATA`, `PGHOST`, `POSTGRES_PASSWORD`, or `REDIS_PASSWORD` into the API service. `DATABASE_URL` and `REDIS_URL` already contain everything the clients need.

Set `DATABASE_SSL=true` for Railway's SSL-enabled PostgreSQL service. The API enables TLS for the hosted connection.

## First deployment verification

After applying staged Railway changes and deploying:

1. Confirm the pre-deploy migration exits successfully.
2. Open `/api/v1/health` on the API's public domain.
3. Confirm deployment logs show a PostgreSQL connection without printing connection strings.
4. Exercise a Redis-backed health check once one is added; Redis is currently lazy-connected because no queue/cache feature consumes it yet.
5. Restrict the development API's CORS origins to the deployed web and admin domains.

## Secret handling

Never commit a Railway connection URL or password. If a credential has been pasted into chat, an issue, or another non-secret channel, rotate it in Railway and keep the replacement only in Railway variables or an ignored local environment file.
