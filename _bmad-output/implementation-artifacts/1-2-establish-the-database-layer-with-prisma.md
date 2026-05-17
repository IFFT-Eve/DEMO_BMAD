# Story 1.2: Establish the database layer with Prisma

Status: done

## Story

As a developer,
I want the full Prisma data model and a local SQLite database in place,
so that feature stories can persist and read their data through a typed, owned data layer.

## Acceptance Criteria

1. **Prisma v7 and the better-sqlite3 driver adapter are installed.** `package.json` lists `prisma` (devDep), `@prisma/client`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`, and `@types/better-sqlite3` at compatible versions. [Source: architecture.md#ADR-005, #Verified-Technology-Versions]

2. **`prisma/schema.prisma` defines all seven models exactly as specified in ADR-005.** Models `User`, `Session`, `Product`, `Cart`, `CartItem`, `Order`, and `OrderItem` are present with the correct fields, types, relations, and constraints — including: money fields as `Int` (cents, ADR-008); `Cart` with nullable and mutually exclusive `userId` / `guestToken` each `@unique`; `CartItem` with a `@@unique([cartId, productId])` composite; `Order` with `ref` `@unique` and both nullable `userId` and `guestToken`; `OrderItem` with snapshotted `productName` and `unitPriceCents`. [Source: architecture.md#Data-Architecture]

3. **An initial migration is generated and applied, creating `prisma/dev.db`.** Running `npx prisma migrate dev --name init` succeeds and `prisma/dev.db` exists as a SQLite file. [Source: epics.md#Story-1.2-AC1]

4. **A Prisma client singleton is exported from `src/server/db.ts`.** The singleton uses the `@prisma/adapter-better-sqlite3` driver adapter, reads `DATABASE_URL` from the environment (stripping the `file:` prefix for the raw file path), and is module-scoped (no re-instantiation across hot-reloads in dev). [Source: architecture.md#Data-Architecture, #Architectural-Boundaries]

5. **Previously written rows survive an application restart (NFR-R1).** After writing a row to the SQLite file and restarting the process, the row is still present. [Source: epics.md#Story-1.2-AC2; NFR-R1]

6. **`prisma/seed.ts` inserts a fixed product catalog.** The seed script creates at least five products, each with: `slug` (URL-safe unique string), `name`, `description`, `imageUrl` (relative path under `/products/` or a placeholder URL), `priceCents` (integer cents), and `stock` (integer ≥ 0). Running the seed script twice is idempotent (uses `upsert` on slug). [Source: epics.md#Story-1.2-AC3; architecture.md#Data-Architecture; A1]

7. **`package.json` has `prisma.seed` configured and the seed runs via `npx prisma db seed`.** The seed command is `ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts` (or equivalent that works in this project). `ts-node` is installed as a dev dependency if not already present. [Source: architecture.md#Infrastructure-and-Deployment — SC5 setup contract]

8. **`.env` is present with `DATABASE_URL=file:./prisma/dev.db` and `.env.example` is committed with the same key and a placeholder value.** `.env` is listed in `.gitignore`. [Source: architecture.md#Infrastructure-and-Deployment]

9. **`npm run lint` passes with zero errors and `npm run build` succeeds** after all changes. [Source: CLAUDE.md#1, #2; dev.md checklist]

## Tasks / Subtasks

- [x] **Task 1: Install dependencies** (AC: #1)
  - [x] Run: `npm install @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3`
  - [x] Run: `npm install --save-dev prisma @types/better-sqlite3 ts-node tsx dotenv`
  - [x] Verify `package.json` reflects all packages at compatible versions.

- [x] **Task 2: Set up environment configuration** (AC: #8)
  - [x] Created `.env` with `DATABASE_URL="file:./prisma/dev.db"`.
  - [x] Created `.env.example` with same key and value (committed template).
  - [x] Added `!.env.example` exception to `.gitignore` (scaffold had `.env*` which would have swallowed `.env.example`); added `/prisma/dev.db` to `.gitignore`.

- [x] **Task 3: Initialize Prisma and write the schema** (AC: #2)
  - [x] Ran `npx prisma init --datasource-provider sqlite` — generates `prisma/schema.prisma` and `prisma.config.ts` (Prisma v7 pattern: datasource URL in config file, not schema).
  - [x] Replaced schema body with all seven ADR-005 models verbatim. Installed `dotenv` for `prisma.config.ts`.
  - [x] Verified: `Cart.userId String? @unique`, `Cart.guestToken String? @unique`, `CartItem @@unique([cartId, productId])`, `OrderItem.productName String`, `OrderItem.unitPriceCents Int`, all money fields `Int`.

- [x] **Task 4: Generate and apply the initial migration** (AC: #3)
  - [x] `npx prisma migrate dev --name init` succeeded; `prisma/dev.db` created; `prisma/migrations/20260515024351_init/` present.
  - [x] `npx prisma generate` run to produce `src/generated/prisma/` client.

- [x] **Task 5: Create the Prisma client singleton** (AC: #4, #5)
  - [x] Created `src/server/db.ts`. Note: Prisma v7 `PrismaBetterSqlite3` takes `{ url: filePath }` directly (not a Database instance). Import from relative `../generated/prisma/client` (not `@/generated/…`) for seed/ts-node compatibility. Module-level singleton guard via `globalThis.db`.

- [x] **Task 6: Write the seed script** (AC: #6, #7)
  - [x] Created `prisma/seed.ts` with 6 products using `db.product.upsert` on `slug` — idempotent.
  - [x] Seed configured in `prisma.config.ts#migrations.seed` (Prisma v7 moved seed from `package.json` to config file). Using `tsx prisma/seed.ts` (ts-node fails on ESM-only Prisma v7 generated client).
  - [x] `npx prisma db seed` ran twice successfully — idempotent, 6 products each time.

- [x] **Task 7: Verify persistence (NFR-R1)** (AC: #5)
  - [x] Queried SQLite directly: all 7 tables present, 6 products with correct fields and cent values. Data present after process exit — NFR-R1 confirmed.
  - [x] `/prisma/dev.db` and `/prisma/dev.db-journal` added to `.gitignore`.

- [x] **Task 8: Lint, build, and record** (AC: #9)
  - [x] `npm run lint` → exit 0, zero output.
  - [x] `npm run build` → `✓ Compiled successfully in 1630ms`, TypeScript checked, build finalized.

## Dev Notes

### Scope of this story

This story installs and configures the **data layer only**. Do not add tRPC, shadcn/ui, or any route handler — those are Stories 1.3 and 1.4. The only application code produced here is `src/server/db.ts` and `prisma/seed.ts`. All other files are Prisma configuration (`schema.prisma`, `migrations/`, `.env`, `.env.example`, `package.json` changes).

### Prisma v7 with the better-sqlite3 driver adapter

Prisma v7 uses the Rust-free client with driver adapters. The `better-sqlite3` adapter is synchronous and avoids the native module complexity of Prisma's own SQLite engine. The exact import is:

```ts
import { PrismaClient } from '@prisma/client'
import { PrismaAdapterBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
```

The `DATABASE_URL` in `.env` must be `file:./prisma/dev.db` for `prisma migrate` to work; strip the `file:` prefix in `db.ts` for the `Database` constructor which expects a plain file path.

### Module-level singleton guard pattern

Next.js hot-reloads modules in dev, which can exhaust SQLite connections. Use:

```ts
const globalForPrisma = globalThis as unknown as { db: PrismaClient | undefined }
export const db = globalForPrisma.db ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db
```

This is the standard pattern for Prisma + Next.js and matches CLAUDE.md §2 (stateless, resilient).

### Exact data model from ADR-005

The schema in `architecture.md#Data-Architecture` is the canonical source. Reproduce it verbatim. Key invariants to verify:
- `Cart.userId String? @unique` and `Cart.guestToken String? @unique` — mutually exclusive, both nullable, both unique.
- `CartItem @@unique([cartId, productId])` — one row per product per cart.
- `Order.ref String @unique` — human-usable reference for the `/order/[ref]` route.
- `OrderItem.productName String` and `OrderItem.unitPriceCents Int` — snapshot fields; no relation back to `Product` from `OrderItem` needed (deliberate denormalization).
- All monetary fields end in `Cents` and are `Int`.

### Seed script

The seed uses `db.product.upsert` on the `slug` field for idempotency. Pick slugs and names that are stable (not generated at runtime). Example seeds (do not use these exact values — write something plausible):

```
{ slug: 'classic-tee', name: 'Classic Tee', priceCents: 1999, stock: 50 }
{ slug: 'canvas-tote', name: 'Canvas Tote Bag', priceCents: 2499, stock: 30 }
{ slug: 'crew-sweatshirt', name: 'Crew Sweatshirt', priceCents: 4999, stock: 20 }
{ slug: 'slim-chinos', name: 'Slim Chinos', priceCents: 7999, stock: 15 }
{ slug: 'wool-beanie', name: 'Wool Beanie', priceCents: 1499, stock: 40 }
```

Use `/products/<slug>.jpg` as `imageUrl` placeholders — the actual image files will not exist in this story; they will be added when the catalog UI is built (Epic 2). The seed must not fail if image files are absent.

### ts-node for the seed script

The seed script imports `@prisma/client` and `@prisma/adapter-better-sqlite3`, both of which are CommonJS compatible. The `ts-node --compiler-options '{"module":"CommonJS"}'` invocation is the standard approach for Prisma seed scripts in a Next.js (ESM-adjacent) project. If this flag causes shell escaping issues in `package.json`, an alternative is to create a `tsconfig.seed.json` with `"module": "CommonJS"` and use `ts-node --project tsconfig.seed.json prisma/seed.ts`.

### Files this story must NOT touch

- `src/app/` (routes, layout, pages) — Story 1.4 owns the app shell.
- `src/components/` — no UI in this story.
- Anything under `_bmad-output/planning-artifacts/` — planning artifacts are read-only.
- `src/server/trpc.ts`, `src/server/context.ts`, `src/server/root.ts` — Story 1.3 creates these.

### References

- [Source: epics.md#Epic-1 — Story 1.2 user story + ACs]
- [Source: architecture.md#ADR-005 — relational data model, model ownership]
- [Source: architecture.md#ADR-008 — money as integer cents]
- [Source: architecture.md#ADR-003 — Cart dual identity fields]
- [Source: architecture.md#Data-Architecture — canonical Prisma schema]
- [Source: architecture.md#Verified-Technology-Versions — Prisma v7, better-sqlite3 adapter]
- [Source: architecture.md#Infrastructure-and-Deployment — SC5 setup contract, .env pattern]
- [Source: architecture.md#Project-Structure-and-Boundaries — src/server/db.ts as sole Prisma entry point]
- [Source: CLAUDE.md#1, #2 — code quality and large-system rules]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (high effort)

### Debug Log References

- **Prisma v7 API changes vs. prior versions:** `prisma init` generates a `prisma.config.ts` file (not `schema.prisma`-embedded datasource URL); seed is configured in `prisma.config.ts#migrations.seed` (not `package.json#prisma.seed`); `PrismaBetterSqlite3` takes `{ url }` not a `Database` instance; generated client is ESM-only at `src/generated/prisma/` (not `@prisma/client`).
- **ts-node → tsx:** ts-node in CommonJS mode fails on the ESM-only Prisma v7 generated client. Switched to `tsx` which handles ESM/CJS interop cleanly.
- **Path alias in seed:** `@/generated/prisma/client` is not resolved by ts-node/tsx running outside Next.js. Using relative import `../generated/prisma/client` in `db.ts` — both resolve to the same file; relative works universally.
- **PrismaBetterSqlite3 type:** Adapter exports `PrismaBetterSqlite3` implementing `SqlMigrationAwareDriverAdapterFactory`. The generated client expects `SqlDriverAdapterFactory`. Used `as any` cast localized to `createPrismaClient()` — a practical interop seam; no runtime impact.
- **tsconfig.seed.json:** Created but not ultimately used (ts-node abandoned for tsx). Kept in repo as it is harmless.

### Completion Notes List

Story 1.2 complete — all 9 ACs met. Evidence:

- **AC1 — Dependencies:** `@prisma/client@7.8.0`, `@prisma/adapter-better-sqlite3@7.8.0`, `better-sqlite3@12.10.0`, `prisma@7.8.0`, `@types/better-sqlite3@7.6.13`, `tsx@4.22.0`, `dotenv@17.4.2` installed.
- **AC2 — Schema:** `prisma/schema.prisma` defines all 7 models exactly per ADR-005 — `Cart.userId String? @unique`, `Cart.guestToken String? @unique`, `CartItem @@unique([cartId, productId])`, `OrderItem.productName String`, `OrderItem.unitPriceCents Int`, all monetary fields `Int`.
- **AC3 — Migration:** `npx prisma migrate dev --name init` → `prisma/dev.db` created, migration `20260515024351_init` applied. `prisma/migrations/` present.
- **AC4 — Singleton:** `src/server/db.ts` exports `db` — strips `file:` prefix from `DATABASE_URL`, uses `PrismaBetterSqlite3({ url })`, module-level singleton guard via `globalThis.db`.
- **AC5 — NFR-R1:** Direct SQLite query after process exit confirms all 7 tables and 6 seeded products persistent.
- **AC6 — Seed:** `prisma/seed.ts` seeds 6 products with all required fields; `db.product.upsert` on `slug` makes it idempotent. Two consecutive runs produce the same 6-row result.
- **AC7 — Seed command:** `prisma.config.ts#migrations.seed: "tsx prisma/seed.ts"` works cleanly.
- **AC8 — Env files:** `.env` (gitignored), `.env.example` (committed via `!.env.example` exception), `/prisma/dev.db` gitignored.
- **AC9 — Lint/build:** `npm run lint` → exit 0; `npm run build` → `✓ Compiled successfully in 1630ms`, TypeScript clean, 4 static pages generated.

### File List

New:
- `.env` — DATABASE_URL (gitignored)
- `.env.example` — committed template
- `prisma/schema.prisma` — ADR-005 7-model schema
- `prisma.config.ts` — Prisma v7 config (datasource URL + seed command)
- `prisma/migrations/20260515024351_init/migration.sql` — initial schema migration
- `prisma/dev.db` — SQLite database (gitignored)
- `prisma/seed.ts` — idempotent product seed (6 products)
- `src/server/db.ts` — Prisma client singleton
- `src/generated/prisma/` — generated Prisma client (gitignored per scaffold)
- `tsconfig.seed.json` — CommonJS tsconfig (created for ts-node; not actively used)

Modified:
- `.gitignore` — added `!.env.example` exception, `/prisma/dev.db`, `/prisma/dev.db-journal`
- `package.json` — added runtime deps + devDeps; `prisma.seed` key (legacy, not used by v7)
- `prisma.config.ts` — updated to final seed command

## QA Review (Independent)

**Reviewer:** QA persona, run independently of Dev per the project's dev/QA
independence rule — verified by re-inspecting the filesystem and re-running the
checks, not by trusting the Dev completion notes.
**Date:** 2026-05-15 · **Checklist:** `.claude/quality/checklists/qa.md`

### Gate Decision: ✅ PASS

| AC | Independent verification | Result |
|----|--------------------------|--------|
| AC1 | `package.json` re-read: `@prisma/client@^7.8.0`, `@prisma/adapter-better-sqlite3@^7.8.0`, `better-sqlite3@^12.10.0`, `prisma@^7.8.0`, `@types/better-sqlite3@^7.6.13` present | ✅ |
| AC2 | `prisma/schema.prisma` inspected: 7 models (`User`, `Session`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`); `Cart.userId String? @unique`, `Cart.guestToken String? @unique`, `CartItem @@unique([cartId, productId])`; `OrderItem.productName String`, `OrderItem.unitPriceCents Int`; all monetary fields `Int` (priceCents, shippingCents, subtotalCents, totalCents, unitPriceCents) | ✅ |
| AC3 | `prisma/dev.db` exists (108K); `prisma/migrations/20260515024351_init/` directory present | ✅ |
| AC4 | `src/server/db.ts` re-read: exports `db`; reads `DATABASE_URL`, strips `file:` prefix; uses `PrismaBetterSqlite3({ url: filePath })`; module-level singleton via `globalThis.db`; no other file imports Prisma directly (grep across `src/` confirmed) | ✅ |
| AC5 — NFR-R1 | Direct SQLite query via `better-sqlite3` (process exited): 6 products present — data persists across restart | ✅ |
| AC6 | `prisma/seed.ts` uses `db.product.upsert` on `slug`; 6 products with all required fields (slug, name, description, imageUrl, priceCents, stock); ran twice — output identical both times | ✅ |
| AC7 | `prisma.config.ts#migrations.seed: "tsx prisma/seed.ts"` confirmed; `npx prisma db seed` executes successfully | ✅ |
| AC8 | `.env` has `DATABASE_URL`; `.env.example` committed (`.gitignore` has `!.env.example` exception); `/prisma/dev.db` and `/prisma/dev.db-journal` gitignored | ✅ |
| AC9 | `npm run lint` → exit 0 (no output); `npm run build` → `✓ Compiled successfully`, TypeScript clean | ✅ |

**Findings (minors — fixed during QA pass, no dev loop required):**
- M1 — `tsconfig.seed.json` was a dead file (created for ts-node approach, abandoned when tsx was adopted). **Fixed:** removed.
- M2 — `ts-node` was installed but not used (replaced by `tsx`). **Fixed:** uninstalled.
- M3 — `package.json#prisma.seed` key was a Prisma v5/v6 convention; Prisma v7 reads seed from `prisma.config.ts`. **Fixed:** removed the no-op key.
- **Observation (not a finding):** `db.ts` uses `as any` for the adapter argument to bridge `PrismaBetterSqlite3` (`SqlMigrationAwareDriverAdapterFactory`) and the generated client's expected `SqlDriverAdapterFactory`. Localized to one private function with an eslint-disable comment. This is the correct interop pattern for Prisma v7; no runtime impact; no action required.

**Blocker:** 0 · **Major:** 0 · **Minor:** 3 (all fixed during QA pass)

**Notes:** Story scope is correctly limited to the data layer only — no tRPC, no UI, no feature code. CLAUDE.md §1/§2 compliance: `db.ts` is 19 lines, single responsibility, meaningful names, explicit error on missing env var, no magic values. Layering enforced: grep across `src/` confirms only `src/server/db.ts` imports from Prisma. Security: no secrets in code, no PII in seed data. **Story may proceed — no loop back to Dev.**

## Change Log

| Date | Change |
|------|--------|
| 2026-05-15 | Story 1.2 created by create-story persona. Status → ready-for-dev. |
| 2026-05-15 | Story 1.2 implemented by Dev persona. All 9 ACs met. Status → review. |
| 2026-05-15 | Independent QA review — gate **PASS**, all 9 ACs verified. 3 minors fixed in QA pass (tsconfig.seed.json, ts-node, package.json prisma.seed key). Status → done. |
