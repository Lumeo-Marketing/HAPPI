# HAPPI Monorepo Scaffolding Guide

HAPPI should be structured as a **pnpm workspace + Turborepo monorepo**. This gives us clean app separation, shared packages, fast builds, and room to grow.

## Recommended High-Level Structure

```text
happi/
├── apps/
│   ├── web/                  # Customer-facing app - Next.js
│   ├── admin/                # Admin dashboard - React + Vite
│   └── api/                  # Backend - NestJS
│
├── packages/
│   ├── ui/                   # Shared Shadcn/Radix components
│   ├── config/               # Shared configs/constants
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Shared utility functions
│   ├── validation/           # Shared Zod schemas
│   ├── fonts/                # Shared font exports/config
│   ├── eslint-config/        # Shared ESLint config
│   └── tsconfig/             # Shared TypeScript configs
│
├── tooling/
│   └── scripts/              # Future build/dev scripts
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
└── README.md
```

## Architecture Diagram

```text
                         HAPPI MONOREPO
                              │
              ┌───────────────┴───────────────┐
              │                               │
            apps/                         packages/
              │                               │
      ┌───────┼────────┐          ┌───────────┼────────────┐
      │       │        │          │           │            │
     web    admin     api         ui         types        utils
      │       │        │          │           │            │
   Next.js   Vite    NestJS     Shadcn      Shared      Shared
   Client    React    Backend    Radix       TS Types    Logic
      │       │        │
      │       │        └──── PostgreSQL / services
      │       │
      └───────┴────────── use shared packages
```

## Proposed Stack

```text
pnpm
Turborepo
Next.js
React + Vite
NestJS
TypeScript
Tailwind CSS
Shadcn UI
Radix UI
Zod
```

## 1. Create the Monorepo

```bash
mkdir happi
cd happi
pnpm init
mkdir apps packages tooling
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

Install Turborepo:

```bash
pnpm add -D turbo
```

Root `package.json`:

```json
{
  "name": "happi",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@10"
}
```

## 2. Scaffold Customer App — Next.js

```bash
pnpm create next-app apps/web
```

Recommended options:

```text
TypeScript       Yes
ESLint           Yes
Tailwind CSS     Yes
src/ directory   Yes
App Router       Yes
Turbopack        Yes
Import alias     @/*
```

Suggested result:

```text
apps/web/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── public/
└── package.json
```

## 3. Scaffold Admin — React + Vite

```bash
pnpm create vite apps/admin --template react-ts
cd apps/admin
pnpm install
cd ../..
```

Suggested structure:

```text
apps/admin/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── main.tsx
└── package.json
```

If using React Router:

```bash
pnpm --filter admin add react-router-dom
```

## 4. Scaffold NestJS Backend

```bash
pnpm dlx @nestjs/cli new apps/api --package-manager pnpm
```

Suggested backend structure:

```text
apps/api/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── therapists/
    │   ├── bookings/
    │   ├── payments/
    │   ├── sessions/
    │   └── notifications/
    ├── common/
    │   ├── decorators/
    │   ├── guards/
    │   ├── filters/
    │   ├── interceptors/
    │   └── pipes/
    ├── config/
    ├── database/
    ├── app.module.ts
    └── main.ts
```

Likely HAPPI backend modules:

```text
auth
clients
therapists
verification
bookings
availability
payments
payouts
wallet
sessions
notifications
admin
```

## 5. Shared UI Package

```bash
mkdir -p packages/ui/src/components
```

`packages/ui/package.json`:

```json
{
  "name": "@happi/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./*": "./src/*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

Suggested structure:

```text
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   └── select.tsx
│   ├── primitives/
│   ├── icons/
│   └── index.ts
├── components.json
└── package.json
```

Usage:

```tsx
import { Button } from "@happi/ui/components/button";
```

This package should hold the shared **Shadcn UI + Radix UI** component layer.

## 6. Add Shared Packages to Apps

```bash
pnpm --filter web add @happi/ui@workspace:*
pnpm --filter admin add @happi/ui@workspace:*
pnpm --filter web add @happi/types@workspace:*
pnpm --filter admin add @happi/types@workspace:*
```

## 7. Shared TypeScript Types

```text
packages/types/
├── src/
│   ├── user.ts
│   ├── therapist.ts
│   ├── booking.ts
│   ├── payment.ts
│   ├── session.ts
│   └── index.ts
└── package.json
```

Example:

```ts
export type TherapistVerificationStatus =
  | "pending"
  | "approved"
  | "more_information_required"
  | "rejected"
  | "suspended";
```

Usage:

```ts
import type { TherapistVerificationStatus } from "@happi/types";
```

Do **not** expose database entities directly to the frontend. Share only public contracts such as:

```text
DTOs
enums
API response types
validation schemas
```

## 8. Shared Zod Validation

```text
packages/validation/
├── src/
│   ├── auth.ts
│   ├── therapist.ts
│   ├── booking.ts
│   └── index.ts
```

Example:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

## 9. Shared Utils

```text
packages/utils/
└── src/
    ├── currency.ts
    ├── date.ts
    ├── timezone.ts
    ├── strings.ts
    └── index.ts
```

Useful HAPPI examples:

```ts
formatCurrency()
formatSessionDuration()
convertTimezone()
formatTherapistName()
```

## 10. Shared Fonts

```text
packages/fonts/
├── src/
│   ├── index.ts
│   └── fonts.css
├── assets/
│   ├── regular.woff2
│   └── medium.woff2
└── package.json
```

Because **Next.js uses `next/font`** while Vite does not, share font assets, font-family names, CSS variables, and design tokens rather than forcing both apps through the same loading implementation.

Example:

```css
:root {
  --font-sans: "HappiSans", sans-serif;
}
```

## 11. Shared Design Tokens

Suggested structure:

```text
packages/ui/
├── src/
│   ├── components/
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css
│   └── index.ts
```

Example:

```css
:root {
  --primary: 240 100% 50%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

## 12. Turbo Config

Root `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

Run all apps:

```bash
pnpm dev
```

Run individually:

```bash
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter api start:dev
```

## 13. Recommended Final Structure

```text
happi/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── services/
│   │   └── package.json
│   ├── admin/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── services/
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── therapists/
│       │   │   ├── verification/
│       │   │   ├── availability/
│       │   │   ├── bookings/
│       │   │   ├── payments/
│       │   │   ├── payouts/
│       │   │   ├── sessions/
│       │   │   └── notifications/
│       │   ├── common/
│       │   ├── config/
│       │   └── database/
│       └── package.json
├── packages/
│   ├── ui/
│   │   └── src/
│   │       ├── components/
│   │       ├── icons/
│   │       └── styles/
│   ├── types/
│   ├── validation/
│   ├── utils/
│   ├── config/
│   ├── fonts/
│   ├── eslint-config/
│   └── tsconfig/
├── tooling/
│   └── scripts/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
├── .gitignore
└── README.md
```

## Architectural Convention

Use:

```text
apps/
= deployable applications

packages/
= reusable code
```

So the preferred structure is:

```text
apps/
├── web
├── admin
└── api
```

This also leaves room for future deployable applications:

```text
apps/
├── web
├── admin
├── api
├── mobile
├── worker
└── docs
```

A future `apps/worker` could handle:

```text
email notifications
session reminders
therapist payouts
payment reconciliation
webhooks
scheduled tasks
```

while still consuming shared packages from the same monorepo.
