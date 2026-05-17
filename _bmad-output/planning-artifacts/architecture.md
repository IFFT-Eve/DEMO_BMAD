---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'prd-validation-report.md', 'ux-design-specification.md', 'product-brief-bmad_demo.md', 'product-brief-bmad_demo-distillate.md']
workflowType: 'architecture'
project_name: 'bmad_demo'
user_name: 'Viettung'
date: '2026-05-14'
lastStep: 8
status: 'complete'
completedAt: '2026-05-14'
---

# Architecture Decision Document — bmad_demo

**Author:** Viettung · **Date:** 2026-05-14

Single source of truth for all technical decisions on `bmad_demo`. Every persona
and AI agent implementing this project follows this document exactly. It honors
the code-quality and large-system rules in `CLAUDE.md` (Sections 1 & 2) and
covers every PRD functional requirement, NFR, and UX handoff note.

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements.** 28 FRs across 6 capability areas, all local-first
with zero external integrations:

- **Product Catalog (FR1–FR3)** — read-only list and detail views over seeded
  data. Architecturally simple: query + render; no write path.
- **Shopping Cart (FR4–FR11)** — the architecturally interesting area. Cart must
  persist across reload and in-app navigation for *everyone* (FR8) and across
  *sessions* for logged-in users (FR9). A cart indicator is global (FR10).
  Empty-cart checkout is blocked (FR11). This forces a **server-owned cart**, not
  client-only storage.
- **Checkout (FR12–FR15)** — a single sectioned flow with boundary validation
  (FR15). State spans address, shipping selection, and payment.
- **Shipping — mocked (FR16–FR18)** — a bounded module returning fixed methods,
  costs, and estimates; shipping cost folds into the order total.
- **Payment & Order — mocked (FR19–FR23)** — a bounded mock-payment module with
  a deterministic failure path (FR23); order placement persists an Order +
  line items (FR21) and yields a confirmation reference (FR22).
- **User Accounts & Sessions (FR24–FR28)** — guest-first; email/password
  registration and login; persistent server session; guest-cart merge on
  authentication (FR28).

**Non-Functional Requirements.** Drivers that shape the architecture:

- **NFR-P1/P2** — sub-second catalog render; cart mutations reflected in <200 ms
  via **optimistic UI**. → React Query optimistic updates; server-side cart kept
  small.
- **NFR-S1/S2/S3/S4** — passwords stored only as salted one-way hashes; session
  in an HTTP-only cookie; mock card data never persisted or logged; **all
  mutating operations validate and authorize at the API boundary**, and
  account-scoped data is owner-only. → tRPC procedures with Zod input validation
  and an auth middleware; ownership checks in services.
- **NFR-R1/R2** — cart and order state survive an app restart (SQLite file);
  order placement is **atomic**. → Prisma `$transaction` for `placeOrder`.
- **NFR-A1** — WCAG 2.1 AA basics on accessible primitives. → shadcn/ui as-is.
- **NFR-M1** — end-to-end type safety client → API → DB. → TypeScript + tRPC +
  Prisma, one typed pipeline; no untyped boundaries.

### Scale & Complexity

- **Primary domain:** full-stack web application (Next.js App Router — frontend
  and server in one deployable unit).
- **Complexity level:** **low–medium.** Bounded feature set, single user, single
  local environment, no concurrency/scale targets (PRD "Explicitly Not
  Required"). The only non-trivial design problems are (a) one cart identity that
  spans guest and authenticated states and (b) atomic order placement.
- **Estimated architectural components:** ~7 — catalog, cart, checkout,
  mock-shipping, mock-payment, orders, auth/session — plus the shared data and
  API-contract layers.

### Technical Constraints & Dependencies

- **Stack is a fixed product-owner constraint** (PRD §"Project Type"): Next.js
  App Router, TailwindCSS + shadcn/ui, tRPC, Prisma over SQLite, TanStack Query,
  end-to-end TypeScript. The Architecture phase does **not** re-litigate the
  stack — it pins versions, fills the gaps the PRD deferred (D1, D3, data model,
  mock module boundaries), and defines consistency patterns.
- **Zero external services** — payment and shipping are mocked, the database is
  a local SQLite file, product data is seeded. No API keys, accounts, or network
  dependencies at runtime.
- **Single environment** — local development only; no multi-env, multi-tenant,
  or deploy pipeline (per project memory: commit/CI-CD out of scope).

### Cross-Cutting Concerns Identified

- **Cart identity** — one cart concept addressable by *either* a guest cookie
  token *or* a user id, with a defined merge on login (FR28). Touches cart,
  checkout, and auth.
- **Authorization** — every mutating tRPC procedure validates input and checks
  ownership at the boundary (NFR-S4). Touches all routers.
- **End-to-end types** — Zod schemas are the single contract reused by tRPC
  inputs and client forms; Prisma generates DB types. No hand-written DTOs.
- **Mock honesty** — mock-payment and mock-shipping are isolated modules with
  real-looking interfaces and an explicit `simulated: true` marker, so swapping
  in real providers later is a module replacement, not a rewrite.
- **State completeness** — every data-bound view has loading/empty/error/success
  states (UX §6); the architecture must surface error and empty conditions
  through typed results, not exceptions-as-control-flow at the UI.

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application. The PRD fixes the stack, so starter evaluation is
narrow: select the official scaffolder that produces exactly the mandated base
and lets the remaining libraries layer on cleanly.

### Starter Options Considered

- **`create-next-app` (official).** Produces the Next.js App Router base with
  TypeScript, TailwindCSS, ESLint, and Turbopack already wired. tRPC, Prisma,
  shadcn/ui, and TanStack Query layer on top with their own init steps. Exactly
  the mandated base, nothing extra to strip out.
- **`create-t3-app` (T3 stack).** Bundles Next.js + tRPC + Prisma + Tailwind in
  one command — tempting overlap. Rejected: it also opinionates auth
  (NextAuth/Auth.js) and an env-validation layer we'd have to partly unwind,
  and it lags the latest Next.js major. The PRD defers the auth mechanism to
  *this* document (D3) — a starter should not pre-decide it.
- **Custom / manual scaffold.** Rejected — needless effort; `create-next-app` is
  the maintained, current-best base.

### Selected Starter: `create-next-app`

**Rationale.** It is the official, actively maintained scaffolder and emits
precisely the PRD-mandated base (Next.js App Router + TypeScript + Tailwind +
ESLint + Turbopack) with the `@/*` import alias. Every other mandated library
(tRPC, Prisma, TanStack Query, shadcn/ui) is added by its own official init in
the foundational epic, keeping each decision explicit and traceable.

**Initialization command** (foundational epic — first implementation story):

```bash
npx create-next-app@latest bmad_demo \
  --typescript --tailwind --eslint --app --src-dir --turbopack \
  --import-alias "@/*" --use-npm
```

**Architectural decisions provided by the starter:**

- **Language & runtime:** TypeScript, `strict` mode; Node.js LTS; React 19.2.
- **Styling:** TailwindCSS v4 (CSS-first `@theme` config), PostCSS pipeline.
- **Build tooling:** Turbopack (stable, default for `dev` and `build` in Next.js
  16); React Compiler available.
- **Linting:** ESLint with the Next.js config.
- **Code organization:** `src/` directory, App Router under `src/app/`, `@/*`
  path alias to `src/`.
- **Dev experience:** `next dev` with HMR; `AGENTS.md` scaffolded for coding
  agents.

**Note:** running this command is the first implementation story of the
foundational epic ("Epic 0"). shadcn/ui, tRPC, Prisma, and TanStack Query are
initialized in subsequent stories of that same epic (see Project Structure).

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical decisions (block implementation):** technology versions (ADR-001),
layering model (ADR-002), cart persistence + identity (ADR-003), authentication
& session mechanism (ADR-004), the data model (ADR-005), tRPC as the API
contract (ADR-006).

**Important decisions (shape the architecture):** mock-module boundaries
(ADR-007), money representation (ADR-008), validation strategy (ADR-009), order
atomicity (ADR-010).

**Deferred decisions (post-MVP, out of scope by PRD):** real payment/shipping
providers, product search/admin, order history, password reset, multi-env
deployment. Each is a clean module swap or new epic precisely because the mock
modules and the layering keep these seams isolated.

### Verified Technology Versions

| Concern | Choice | Version (verified 2026-05-14) |
|---|---|---|
| Framework / server | Next.js (App Router, Turbopack) | 16.2.x |
| UI runtime | React | 19.2 |
| Styling | TailwindCSS | v4 |
| Component primitives | shadcn/ui (CLI v4) | current |
| API contract | tRPC (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) | v11.13.x |
| Client server-state | TanStack Query (`@tanstack/react-query`) | v5 |
| ORM | Prisma (`prisma`, `@prisma/client`) | v7.x |
| DB driver adapter | `@prisma/adapter-better-sqlite3` | matched to Prisma v7 |
| Database | SQLite (local file) | — |
| Input/contract validation | Zod | v4 |
| Forms | React Hook Form + `@hookform/resolvers` | current |
| Password hashing | Node.js built-in `crypto.scrypt` | — (no dependency) |
| Language | TypeScript (`strict`) | current |

Versions are pinned at install time in the foundational epic; agents use the
exact installed versions and do not silently upgrade across majors.

### Architecture Decision Records

#### ADR-001 — Pinned full-stack TypeScript stack

**Context.** The PRD fixes the stack as a product-owner constraint. Architecture
must pin concrete, current versions so agents build against one known-good set.
**Decision.** Adopt the versions in the table above. Next.js 16 App Router is
the single deployable (frontend + server); tRPC v11 with the classic
`@trpc/react-query` integration is the API layer; Prisma v7 with the
`better-sqlite3` driver adapter is persistence; TanStack Query v5 is client
server-state.
**Consequences.** End-to-end type safety with no untyped boundary (NFR-M1). The
classic `@trpc/react-query` integration is chosen over the newer TanStack-native
integration because it is the most documented and stable path for a reference
build. SQLite via a driver adapter keeps the install dependency-light and
matches Prisma v7's Rust-free client.

#### ADR-002 — Strict inward-pointing layering

**Context.** `CLAUDE.md` §2 mandates separation of concerns with dependencies
pointing inward.
**Decision.** Four layers, dependencies point inward only:
`Presentation (App Router routes + React components)` → `API contract (tRPC
routers)` → `Domain (service modules)` → `Data (Prisma client)`.
- **Presentation** renders and collects input; it calls tRPC, never Prisma.
- **API contract (tRPC routers)** is the boundary: authenticate, authorize, and
  validate every input with Zod, then delegate to a service. Routers contain no
  business logic.
- **Domain (services)** holds all business logic (cart math, merge, checkout
  orchestration, order creation, mock payment/shipping). Services are the only
  code that touches Prisma. Pure, unit-testable, framework-agnostic.
- **Data** is the Prisma client plus the schema; owned exclusively by services.
**Consequences.** Business logic is testable without HTTP or React. The UI
cannot reach the database. Acyclic dependency graph. Mock modules and future
real providers are swapped at the domain layer behind the same service
interface.

#### ADR-003 — Server-side cart with dual identity (resolves PRD D1)

**Context.** FR8 requires cart persistence for *everyone* across reload and
navigation; FR9 requires persistence across *sessions* for logged-in users;
FR28 requires merging a guest cart into an account cart on login. Client-only
storage cannot satisfy FR9 and makes FR28 a client problem.
**Decision.** The cart lives **server-side in SQLite**. A `Cart` row is owned by
**exactly one of**: a `userId` (logged-in) **or** a `guestToken` (guest). The
guest token is a random opaque value stored in an **HTTP-only, SameSite=Lax
cookie** (`guest_cart_token`), minted on first cart write if absent. On the
server, the tRPC context resolves the *active cart* from the session user if
present, else from the guest token. On login/registration, if a non-empty guest
cart exists, the auth service **merges** it into the user's cart — items unioned,
quantities summed for duplicate products — then deletes the guest cart and
clears the guest cookie (FR28).
**Consequences.** One cart source consumed by both the cart drawer and checkout
(UX handoff note). FR8/FR9/FR28 all satisfied server-side. Optimistic UI
(NFR-P2) is layered in the client via React Query over this server cart. Trade-
off vs. client storage: every cart read/write is a server round-trip — acceptable
and in fact required here, and trivial at this scale.

#### ADR-004 — Hand-rolled session auth with scrypt (resolves PRD D3)

**Context.** FR24–FR27 require guest mode, email/password registration/login,
logout, and a persistent session. NFR-S1 requires salted one-way password
hashes; NFR-S2 requires the session credential in an HTTP-only cookie. The PRD
defers the *mechanism* to Architecture.
**Decision.** Implement a **transparent hand-rolled session**:
- Passwords hashed with **Node's built-in `crypto.scrypt`** (salt per password,
  one-way) — zero added dependency, satisfies NFR-S1.
- A **`Session` table** in SQLite: an opaque random session id, `userId`, and
  `expiresAt`. The session id is stored in an **HTTP-only, Secure, SameSite=Lax
  cookie** (`session_token`) — satisfies NFR-S2.
- The tRPC context reads the cookie, looks up a non-expired session, and
  attaches `{ user }` (or `null` for guests). A `protectedProcedure` middleware
  rejects unauthenticated calls; ownership checks live in services.
**Decision rationale (why not Auth.js/NextAuth).** Auth.js's Credentials
provider does not cleanly support database sessions and would pull an external
library plus its own opinionated config for a four-FR need. A hand-rolled
session is fully type-safe through the tRPC context, has zero runtime
dependencies, is pedagogically transparent for a BMAD *reference* build, and
makes DB-backed sessions trivial.
**Consequences.** We own session lifecycle (creation, expiry, logout deletion) —
small and bounded. No social login, no password reset (both explicitly out of
PRD scope). Swapping in Auth.js later is contained to the auth service + tRPC
context.

#### ADR-005 — Relational data model in SQLite via Prisma

**Context.** PRD open item: define the model for Product, Cart, CartItem, User,
Session, Order, OrderItem.
**Decision.** Adopt the schema in the **Data Architecture** section below. Key
choices: money as integer **cents** (ADR-008); `Cart` has nullable, mutually
exclusive `userId`/`guestToken`; `Order` and `OrderItem` **snapshot** product
name and unit price at purchase time so a later catalog edit never rewrites
history; `Order` carries an opaque human-usable `ref` for `/order/[ref]`.
**Consequences.** Ownership of every table is a service (Data layer is owned by
Domain). Forward-only Prisma migrations. The model maps 1:1 to the FRs.

#### ADR-006 — tRPC as the sole API contract

**Context.** NFR-M1 requires typed contracts from client through the API to the
DB; NFR-S4 requires validation/authorization at the boundary.
**Decision.** All client↔server communication goes through **tRPC routers** —
no bespoke REST/route handlers except the single tRPC HTTP handler and Next.js
internals. Every procedure declares a **Zod input schema**; mutations are
`protectedProcedure` or explicitly public; the router authorizes, then calls a
service. Routers: `product`, `cart`, `checkout`, `order`, `auth`.
**Consequences.** One typed pipeline, no DTO drift. The API boundary is the
single validation/authorization choke point (NFR-S4). Errors are `TRPCError`
with standard codes, mapped to UI states by the client.

#### ADR-007 — Mock payment & shipping as isolated domain modules

**Context.** Payment and shipping are mocked (PRD), but the demo must be
"honest about mocks" (UX) and a deterministic failure path is required (FR23,
UX handoff note).
**Decision.** Two self-contained domain modules with real-looking interfaces:
- **`mockShipping`** — `listMethods()` returns a fixed set (e.g. *Standard* and
  *Express*) each with `id`, label, `cost` (cents), and a delivery-estimate
  string. `getMethod(id)` validates a selection.
- **`mockPayment`** — `authorize({ card })` returns a typed result
  `{ status: 'approved' } | { status: 'declined', reason }`. **Deterministic
  failure trigger:** the sentinel card number `4000000000000002` always returns
  `declined`; any other well-formed number returns `approved`. Card data is
  accepted, used in-memory, and **never persisted or logged** (NFR-S3); the
  module exposes `simulated: true`.
**Consequences.** FR23's failure path is reproducible on demand for the demo and
for tests. Swapping in a real provider is replacing one module behind the
checkout service's call site — no checkout-flow rewrite.

#### ADR-008 — Money as integer cents

**Context.** Floating-point currency math is a classic defect source.
**Decision.** All monetary values — product price, line subtotal, shipping cost,
order total — are **integers in minor units (cents)** in the DB, services, and
tRPC payloads. Formatting to a display string happens only at the presentation
edge.
**Consequences.** No float rounding drift in cart/checkout/order math. One
formatting helper at the UI boundary.

#### ADR-009 — Zod schemas as the shared validation contract

**Context.** NFR-S4 requires boundary validation; the UX requires inline form
validation (FR15). Duplicating rules invites drift.
**Decision.** Zod schemas defined once in a shared module are the **single
contract**: tRPC procedures use them as input validators, and React Hook Form
uses the same schemas via `@hookform/resolvers/zod`. The server is always
authoritative; client validation is a UX convenience over the same rules.
**Consequences.** One source of truth for shape and constraints. FR15 satisfied
on both sides without divergence.

#### ADR-010 — Atomic order placement via Prisma transaction

**Context.** NFR-R2 requires order placement to be all-or-nothing.
**Decision.** `checkoutService.placeOrder` runs inside a single Prisma
`$transaction`: create the `Order`, create all `OrderItem` rows, and clear the
cart — committed together or not at all. Mock payment authorization runs
*before* the transaction; only an approved authorization opens it. A declined
payment (FR23) returns a typed failure and leaves the cart and checkout state
fully intact.
**Consequences.** No partial orders, no emptied cart on failure. The
payment-failure recovery path (FR23/J4) falls out naturally — nothing to undo.

### Data Architecture

Prisma schema over a local SQLite file (`prisma/dev.db`), accessed through the
`better-sqlite3` driver adapter.

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  carts        Cart[]
  sessions     Session[]
  orders       Order[]
}

model Session {
  id        String   @id @default(cuid())   // opaque token stored in the cookie
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([userId])
}

model Product {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String
  imageUrl    String
  priceCents  Int                              // ADR-008
  stock       Int                              // availability for FR2
  createdAt   DateTime   @default(now())
  cartItems   CartItem[]
}

model Cart {
  id         String     @id @default(cuid())
  userId     String?    @unique               // owned by a user ...
  user       User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  guestToken String?    @unique               // ... OR a guest cookie token (ADR-003)
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  @@unique([cartId, productId])               // one row per product per cart
}

model Order {
  id              String      @id @default(cuid())
  ref             String      @unique          // human-usable reference for /order/[ref]
  userId          String?                      // null for a guest order
  user            User?       @relation(fields: [userId], references: [id])
  guestToken      String?                      // scopes guest order to its session (UX handoff)
  email           String
  shippingName    String
  shippingLine1   String
  shippingLine2   String?
  shippingCity    String
  shippingPostal  String
  shippingCountry String
  shippingMethod  String                       // selected mock method id
  shippingCents   Int
  subtotalCents   Int
  totalCents      Int
  status          String      @default("confirmed")
  createdAt       DateTime    @default(now())
  items           OrderItem[]
  @@index([userId])
}

model OrderItem {
  id            String @id @default(cuid())
  orderId       String
  order         Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId     String
  productName   String                          // snapshot at purchase (ADR-005)
  unitPriceCents Int                            // snapshot at purchase
  quantity      Int
}
```

**Ownership.** Each model is owned by exactly one service: `User`/`Session` →
`authService`; `Product` → `productService`; `Cart`/`CartItem` → `cartService`;
`Order`/`OrderItem` → `checkoutService`/`orderService`. No service reaches into
another service's tables — it calls the owning service.

**Migrations.** Prisma Migrate, forward-only. The foundational epic creates the
initial migration; later schema changes are additive migrations.

**Seed data (A1).** `prisma/seed.ts` inserts a small fixed product set. No
product-authoring UI exists.

### Authentication & Security

- **Password storage** — `crypto.scrypt` with a per-password random salt; only
  `salt:hash` is persisted in `User.passwordHash`. Plaintext is never persisted
  or logged (NFR-S1).
- **Session** — opaque `Session.id` in an HTTP-only, Secure, SameSite=Lax cookie
  `session_token`; server-side lookup with `expiresAt` enforcement; logout
  deletes the row and clears the cookie (NFR-S2, FR26, FR27).
- **Guest cart token** — opaque value in an HTTP-only, SameSite=Lax cookie
  `guest_cart_token`; minted on first guest cart write; cleared on login after
  merge (ADR-003).
- **Boundary authorization (NFR-S4)** — tRPC `protectedProcedure` middleware
  gates authenticated calls; services additionally verify *ownership* (a user
  may read/modify only their own cart and orders; a guest only their
  token-scoped cart and orders).
- **Mock card data (NFR-S3)** — accepted by `mockPayment` in-memory only; never
  written to the DB, never logged.
- **Secrets** — none required (no external services). Environment-specific
  values (`DATABASE_URL`, cookie flags) come from `.env`, never hardcoded.

### API & Communication Patterns

- **Transport** — tRPC over a single Next.js route handler at
  `/api/trpc/[trpc]`; client uses `@trpc/react-query` bound to TanStack Query.
- **Routers & procedures:**
  - `productRouter` — `list()`, `byId(id)` *(public queries)*
  - `cartRouter` — `get()`, `addItem({ productId, quantity })`,
    `updateItem({ productId, quantity })`, `removeItem({ productId })`
    *(public — operate on the context-resolved active cart)*
  - `checkoutRouter` — `getShippingMethods()` *(public query)*,
    `placeOrder({ shippingAddress, shippingMethodId, payment })` *(public
    mutation; runs ADR-010)*
  - `orderRouter` — `byRef(ref)` *(public query; service enforces the order is
    owned by the caller's user or guest token)*
  - `authRouter` — `register({ email, password })`, `login({ email, password })`,
    `logout()`, `me()`
- **Error handling** — services throw typed `TRPCError`s (`UNAUTHORIZED`,
  `FORBIDDEN`, `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`); the client maps codes to
  UI states (toast vs. inline alert vs. 404 route). Payment *decline* is **not**
  an error — it is a typed success result `{ status: 'declined' }` so the UX can
  render an inline, recoverable Payment-section error (FR23).
- **No rate limiting / no API versioning** — single-user local demo; explicitly
  out of scope per PRD.

### Frontend Architecture

- **Rendering** — Server Components for initial data-bound reads where natural
  (catalog list, product detail, confirmation); Client Components for everything
  interactive (cart drawer, checkout form, auth forms, header cart badge).
- **Server-state** — TanStack Query via `@trpc/react-query` is the *only* server
  cache. No Redux/Zustand: the cart is server-owned (ADR-003), so "global cart
  state" is just a tRPC query (`cart.get`) shared by the header badge and the
  cart drawer.
- **Optimistic updates (NFR-P2)** — `cart.addItem/updateItem/removeItem` use
  React Query optimistic mutation: update the cached cart immediately, confirm
  on success, roll back + toast on error.
- **Routing** — App Router, routes exactly as the UX IA table: `/`,
  `/products/[id]`, `/checkout`, `/order/[ref]`, `/login`, `/register`. A
  root layout renders the global header + cart drawer.
- **Forms** — React Hook Form + Zod resolver (ADR-009); inline validation on
  blur and submit (FR15).
- **Styling** — TailwindCSS v4 with a single token layer (CSS variables);
  shadcn/ui primitives used as-is (UX §7). Light theme only.

### Infrastructure & Deployment

- **Runtime** — a single `next` process; SQLite file on local disk. No
  containers, no cloud, no CI/CD (project memory: out of scope).
- **Environments** — one: local development. `.env` holds `DATABASE_URL`;
  `.env.example` is committed, `.env` is not.
- **Setup contract (SC5)** — the whole app comes up from one foundational epic:
  `install` (`npm install`) → `seed` (`npx prisma migrate dev` + `prisma db
  seed`) → `run` (`npm run dev`). No external accounts or keys.
- **Observability** — structured `console`-based logging in services for error
  paths (no secrets, no PII, no card data per NFR-S3); sufficient for a local
  demo. Metrics/tracing explicitly out of scope.

### Decision Impact Analysis

**Implementation sequence.** Foundational epic first: scaffold (`create-next-app`)
→ add Prisma + schema + migrate + seed → add tRPC server/client wiring + context
→ add shadcn/ui. Then feature epics in FR order: catalog → cart → auth →
checkout (shipping + payment + order) — auth precedes checkout so the
guest/registered split and cart-merge are in place before the order flow.

**Cross-component dependencies.** Cart identity (ADR-003) depends on the session
context (ADR-004); checkout (ADR-010) depends on cart, mock-shipping, and
mock-payment (ADR-007); every router depends on the layering contract (ADR-002)
and the Zod schemas (ADR-009).

---

## Implementation Patterns & Consistency Rules

These rules exist so multiple AI agents produce compatible code. They are
mandatory.

### Naming Patterns

**Database (Prisma).** Models `PascalCase` singular (`CartItem`); fields
`camelCase` (`priceCents`, `guestToken`); money fields end in `Cents`;
booleans read as predicates. Let Prisma map table names by default. Relations
named for what they hold (`items`, `user`).

**API (tRPC).** Routers `<noun>Router`; procedures `camelCase` verbs
(`addItem`, `placeOrder`, `byRef`). Queries are nouns/getters, mutations are
verbs. Input objects, not positional args (except a single id/ref).

**Code.** Components `PascalCase` files (`CartDrawer.tsx`); hooks `useX.ts`;
services `<noun>Service.ts` with `camelCase` exported functions; utilities
`camelCase.ts`. Route folders lowercase (`products/[id]`). Booleans
`isX`/`hasX`. No `tmp`, `data2`, `mgr`, `doStuff` (CLAUDE.md §1).

**Zod schemas.** `<Thing>Input` / `<Thing>Schema` in `src/lib/schemas/`, e.g.
`addItemInput`, `shippingAddressSchema`.

### Structure Patterns

- **Tests co-located** as `*.test.ts(x)` next to the unit under test; E2E tests
  under `tests/e2e/`.
- **Components organized by area**: `src/components/ui/` (shadcn primitives,
  generated), `src/components/<feature>/` (feature components, e.g.
  `cart/`, `checkout/`).
- **Services** in `src/server/services/`, **routers** in `src/server/routers/`,
  **Prisma client singleton** in `src/server/db.ts`.
- **Shared types & schemas** in `src/lib/`. No deep relative imports — use the
  `@/*` alias.

### Format Patterns

- **Money** — integer cents end to end; a single `formatPrice(cents)` helper in
  `src/lib/format.ts` is the only place cents become a display string.
- **Dates** — ISO 8601 strings across the tRPC boundary; format at the UI edge.
- **tRPC payloads** — return domain objects directly (tRPC + superjson handle
  serialization); no hand-rolled `{ data, error }` envelope — errors are
  `TRPCError`. The one deliberate exception: `mockPayment.authorize` returns a
  typed `{ status }` union because a decline is a valid outcome, not an error.
- **JSON field naming** — `camelCase` everywhere (DB, API, client) — one
  convention, no boundary translation.

### Communication Patterns

- **Server-state** — every server read is a tRPC query through TanStack Query;
  no `fetch` to internal endpoints from components.
- **Cart mutations** — always optimistic (NFR-P2): cancel in-flight `cart.get`,
  snapshot, apply optimistic update, roll back on error, `invalidate` on settle.
- **No client global store** — shared state that is server-owned (cart, session
  user) is a shared tRPC query; shared state that is purely UI (cart drawer
  open/closed) is local React state or React Context, never a state library.
- **Errors → UI** — `UNAUTHORIZED`/`FORBIDDEN` → redirect or inline auth error;
  `NOT_FOUND` → 404 route; `BAD_REQUEST` (validation) → inline field errors;
  mutation failure → toast + optimistic rollback.

### Process Patterns

- **Validation** — Zod at the tRPC boundary is authoritative (NFR-S4); the same
  schema drives client-side inline validation (ADR-009). Never trust the client.
- **Authorization** — `protectedProcedure` for authenticated-only calls;
  ownership checks inside services for account/guest-scoped data.
- **Error handling** — services fail loudly with typed `TRPCError`; no silent
  catches, no swallowed exceptions (CLAUDE.md §1). The only "caught and
  converted" path is mock-payment decline → typed result.
- **Loading/empty/error states** — every data-bound component implements all
  four states per the UX Screen State Inventory; no happy-path-only components.
- **Transactions** — any multi-row write that must be consistent uses
  `prisma.$transaction` (order placement; guest-cart merge).

### Enforcement Guidelines

**All AI agents MUST:** keep dependencies pointing inward (ADR-002) — UI never
imports Prisma, routers never embed business logic; validate every mutation
input with Zod at the tRPC boundary; represent money as integer cents; implement
loading/empty/error/success for every data-bound view; never persist or log
passwords or mock card data.

**Pattern enforcement.** ESLint + TypeScript `strict` catch most violations;
layering violations are caught in code review (QA persona) against this section;
any deviation must be recorded as a new ADR, not done silently.

### Pattern Examples

**Good** — router stays thin, service holds logic:
```ts
// src/server/routers/cart.ts
addItem: publicProcedure
  .input(addItemInput)                       // Zod, ADR-009
  .mutation(({ input, ctx }) => cartService.addItem(ctx.activeCart, input)),
```

**Anti-pattern** — business logic and Prisma in the router:
```ts
// ❌ violates ADR-002: router doing service + data work
addItem: publicProcedure.mutation(async ({ input, ctx }) => {
  const existing = await prisma.cartItem.findUnique(/* ... */)
  if (existing) await prisma.cartItem.update(/* ...quantity math... */)
  // ...
})
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad_demo/
├── README.md
├── AGENTS.md                       # scaffolded by create-next-app
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
├── .env                            # DATABASE_URL (not committed)
├── .env.example                    # committed template
├── .gitignore
├── prisma/
│   ├── schema.prisma               # ADR-005 data model
│   ├── seed.ts                     # fixed product catalog (A1)
│   ├── migrations/                 # forward-only migrations
│   └── dev.db                      # local SQLite file (not committed)
├── public/
│   └── products/                   # seeded product images
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout: header + cart drawer + providers
│   │   ├── globals.css             # Tailwind v4 @theme tokens
│   │   ├── page.tsx                # `/` catalog grid (FR1)
│   │   ├── products/
│   │   │   └── [id]/page.tsx       # `/products/[id]` detail (FR2, FR3)
│   │   ├── checkout/
│   │   │   └── page.tsx            # `/checkout` sectioned flow (FR12–FR21)
│   │   ├── order/
│   │   │   └── [ref]/page.tsx      # `/order/[ref]` confirmation (FR22)
│   │   ├── login/page.tsx          # `/login` (FR26)
│   │   ├── register/page.tsx       # `/register` (FR25)
│   │   └── api/
│   │       └── trpc/[trpc]/route.ts  # single tRPC HTTP handler (ADR-006)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (generated)
│   │   ├── layout/                 # AppHeader, CartBadge, AccountMenu
│   │   ├── catalog/                # ProductGrid, ProductCard, ProductDetail
│   │   ├── cart/                   # CartDrawer, CartLineItem, QuantityStepper
│   │   ├── checkout/               # CheckoutSections, ShippingForm,
│   │   │                           #   ShippingMethodPicker, PaymentForm,
│   │   │                           #   OrderSummary
│   │   ├── order/                  # OrderConfirmation
│   │   └── auth/                   # LoginForm, RegisterForm
│   ├── server/
│   │   ├── db.ts                   # Prisma client singleton (Data layer)
│   │   ├── trpc.ts                 # tRPC init, context, publicProcedure,
│   │   │                           #   protectedProcedure
│   │   ├── context.ts              # resolves session user + active cart (ADR-003/004)
│   │   ├── root.ts                 # appRouter (merges all routers)
│   │   ├── routers/
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   ├── order.ts
│   │   │   └── auth.ts
│   │   └── services/               # Domain layer — all business logic
│   │       ├── productService.ts
│   │       ├── cartService.ts      # add/update/remove + guest-cart merge (FR28)
│   │       ├── authService.ts      # scrypt hashing, session lifecycle
│   │       ├── checkoutService.ts  # placeOrder transaction (ADR-010)
│   │       ├── orderService.ts     # ownership-scoped order lookup
│   │       ├── mockShipping.ts     # ADR-007
│   │       └── mockPayment.ts      # ADR-007 (sentinel-card failure)
│   ├── lib/
│   │   ├── trpc/                   # client: trpc react-query setup, Provider
│   │   ├── schemas/                # Zod schemas — shared contract (ADR-009)
│   │   ├── format.ts               # formatPrice(cents) and date formatting
│   │   └── constants.ts            # cookie names, session TTL, sentinel card
│   └── types/                      # shared TS types not derived from Prisma/Zod
└── tests/
    ├── e2e/                        # Playwright — J1–J4 journeys
    └── fixtures/                   # shared test data
```

(Unit tests are co-located as `*.test.ts(x)` beside the file under test, per the
structure patterns.)

### Architectural Boundaries

- **API boundary** — `src/app/api/trpc/[trpc]/route.ts` is the *only* network
  entry point. Everything client-side reaches the server only through the tRPC
  client in `src/lib/trpc/`.
- **Component boundary** — components call tRPC hooks; they never import
  anything under `src/server/`. Server Components may call `appRouter`
  server-side callers, but never Prisma directly.
- **Service boundary** — `src/server/services/` is the only code importing
  `src/server/db.ts`. Routers call services; services never import routers.
- **Data boundary** — `prisma/schema.prisma` defines all persisted state;
  `src/server/db.ts` exposes the single client; each table is owned by one
  service (ADR-005).

### Requirements-to-Structure Mapping

| Capability area (FRs) | Primary locations |
|---|---|
| Foundation / setup (Epic 0, SC5) | `package.json`, `prisma/`, `src/server/{db,trpc,context,root}.ts`, `src/lib/trpc/` |
| Product Catalog (FR1–FR3) | `app/page.tsx`, `app/products/[id]/`, `components/catalog/`, `routers/product.ts`, `services/productService.ts` |
| Shopping Cart (FR4–FR11) | `components/cart/`, `components/layout/CartBadge`, `routers/cart.ts`, `services/cartService.ts`, `Cart`/`CartItem` models |
| Checkout (FR12–FR15) | `app/checkout/`, `components/checkout/`, `routers/checkout.ts`, `services/checkoutService.ts` |
| Shipping — mocked (FR16–FR18) | `services/mockShipping.ts`, `components/checkout/ShippingMethodPicker` |
| Payment & Order — mocked (FR19–FR23) | `services/mockPayment.ts`, `services/checkoutService.ts`, `components/checkout/PaymentForm`, `app/order/[ref]/`, `components/order/`, `Order`/`OrderItem` models |
| Accounts & Sessions (FR24–FR28) | `app/login/`, `app/register/`, `components/auth/`, `routers/auth.ts`, `services/authService.ts`, `server/context.ts`, `User`/`Session` models |

**Cross-cutting concerns** — guest/user cart identity: `server/context.ts` +
`cartService` + `authService`; validation contract: `lib/schemas/`; money
formatting: `lib/format.ts`; cookie/session constants: `lib/constants.ts`.

### Integration Points & Data Flow

- **Internal communication** — UI → `@/lib/trpc` client → `/api/trpc` handler →
  `appRouter` → router → service → Prisma → SQLite, and back. One direction in,
  one direction out.
- **External integrations** — none. `mockShipping` and `mockPayment` stand in
  for the only would-be external systems; their interfaces are the seams where
  real providers attach post-MVP.
- **Data flow — place order (J1/J4):** checkout form → `checkout.placeOrder`
  (Zod-validated) → `checkoutService` reads active cart + shipping method →
  `mockPayment.authorize` → if declined, return typed failure (cart intact,
  FR23); if approved, `$transaction` { create Order + OrderItems, clear cart } →
  return order `ref` → client routes to `/order/[ref]`.
- **Data flow — login merge (J3):** `auth.login` → `authService` verifies
  credentials, creates `Session`, sets cookie → if a `guest_cart_token` cookie
  resolves to a non-empty cart, `cartService.mergeGuestCartIntoUser` runs in a
  `$transaction` → guest cart deleted, guest cookie cleared → `cart.get` now
  resolves the merged user cart.

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision compatibility.** The pinned versions (ADR-001) are a known-compatible
set: Next.js 16 / React 19.2, tRPC v11 with `@trpc/react-query` over TanStack
Query v5, Prisma v7 with the `better-sqlite3` adapter. No version conflicts. The
layering (ADR-002), tRPC contract (ADR-006), and Zod strategy (ADR-009)
reinforce each other — one typed pipeline with a single validation choke point.

**Pattern consistency.** Naming, structure, and format patterns are derived
from the chosen stack (Prisma model conventions, tRPC procedure conventions,
App Router file conventions) — no rule contradicts a tool default. The "no
client global store" rule is consistent with the server-owned cart (ADR-003).

**Structure alignment.** The directory tree physically enforces the layering:
`components/` cannot satisfy its imports from `server/services/` without going
through the tRPC client; only `services/` imports `db.ts`. Boundaries are
structural, not just conventional.

### Requirements Coverage Validation ✅

**Functional requirements.** All 28 FRs map to a component + router + service +
(where relevant) model — see the Requirements-to-Structure table and the
per-ADR notes. Spot checks: FR8/FR9/FR28 → ADR-003; FR15 → ADR-009; FR21/FR23 →
ADR-010 + ADR-007; FR24–FR27 → ADR-004.

**Non-functional requirements.** NFR-P1 (Server Components + small seeded
dataset), NFR-P2 (optimistic cart mutations), NFR-S1 (`scrypt` hashing), NFR-S2
(HTTP-only session cookie), NFR-S3 (mock card data never persisted/logged),
NFR-S4 (Zod + `protectedProcedure` + service ownership checks), NFR-R1 (SQLite
file persistence), NFR-R2 (`$transaction`, ADR-010), NFR-A1 (shadcn/ui
primitives), NFR-M1 (TypeScript + tRPC + Prisma typed pipeline) — each is
addressed by a named decision.

**UX handoff notes.** "One cart source for drawer and checkout" → ADR-003.
"`/order/[ref]` reachable by guest-in-session and owning user" → `Order`
carries both `userId` and `guestToken`; `orderService` enforces scope.
"Deterministic mock-payment failure trigger" → ADR-007 sentinel card
`4000000000000002`.

### Implementation Readiness Validation ✅

**Decision completeness.** All six critical and four important decisions are
recorded as ADRs with concrete versions and rationale. No `TBD` remains on
anything the Dev persona needs to start. The PRD's two deferred Architecture
items (D1, D3) are resolved (ADR-003, ADR-004), and the requested data model and
mock-module boundaries are fully specified.

**Structure completeness.** The project tree is concrete — every route, router,
service, and model has a named home. The implementation sequence and the
foundational-epic setup contract (SC5) are explicit.

**Pattern completeness.** Naming, structure, format, communication, and process
patterns each have rules and at least one example, plus an anti-pattern for the
highest-risk conflict (router/service layering).

### Gap Analysis Results

- **Critical gaps:** none.
- **Important gaps:** none blocking. The exact shadcn/ui component install list
  is enumerated in UX §7 and pulled in during the foundational epic — not an
  architectural gap.
- **Nice-to-have (deferred, consistent with PRD scope):** structured logging
  beyond `console`, metrics/tracing, CI/CD, multi-environment config — all
  explicitly out of scope; the seams (service layer, mock modules, `.env`
  config) are in place to add them later without rework.

### Validation Issues Addressed

One was considered and resolved during design: the newer TanStack-native tRPC
integration vs. the classic `@trpc/react-query` integration. Resolved in
ADR-001 in favor of the classic integration — more documented and stable for a
reference build; the optimistic-update patterns assume it.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION — all 16 checklist items are `[x]`
and no Critical Gaps remain.

**Confidence Level:** High. The stack was a fixed constraint (low decision
risk), the requirement set is bounded, every FR/NFR traces to a decision, and
the two genuinely open design problems (cart identity, session mechanism) are
resolved with explicit ADRs and trade-offs.

**Key Strengths.** End-to-end type safety with a single validation choke point;
structural enforcement of layering; mock modules isolated as clean future-swap
seams; full FR/NFR/UX traceability; zero external dependencies — `install → seed
→ run` (SC5) holds.

**Areas for Future Enhancement.** Real payment/shipping providers (swap ADR-007
modules), product search/admin, order history, password reset, structured
observability, CI/CD — each is an additive epic or a contained module swap, by
design.

### Implementation Handoff

**AI Agent Guidelines.** Follow every ADR exactly; keep dependencies pointing
inward (ADR-002); validate every mutation at the tRPC boundary with the shared
Zod schemas; money is integer cents; implement all four view states; never
persist or log passwords or mock card data.

**First Implementation Priority.** The foundational epic ("Epic 0"):
```bash
npx create-next-app@latest bmad_demo \
  --typescript --tailwind --eslint --app --src-dir --turbopack \
  --import-alias "@/*" --use-npm
```
then add Prisma + schema + migrate + seed, tRPC server/client wiring + context,
and shadcn/ui — as described in the Decision Impact Analysis sequence.

---

## ✅ Validation Summary

**Checklist:** `.claude/quality/checklists/architecture.md` — all items pass.

- **(critical)** Every PRD FR and NFR addressed by a decision — full coverage,
  no gaps (Requirements Coverage Validation; Requirements-to-Structure table).
- **(critical)** Components, responsibilities, and boundaries defined; dependency
  direction explicit and acyclic (ADR-002; Architectural Boundaries).
- **(critical)** Significant technology choices justified with trade-offs and
  recorded as ADRs (ADR-001–010, including "why not Auth.js", "why not
  create-t3-app", "why classic tRPC integration").
- **(critical)** No ambiguous `TBD` — PRD D1 and D3 resolved; data model and
  mock-module boundaries fully specified.
- Data model/schema defined with per-table ownership; API contracts (inputs,
  errors) specified per router; NFRs designed for; failure modes and resilience
  addressed (typed payment decline, atomic transactions, optimistic rollback);
  deployment/config strategy described; honors `CLAUDE.md` §2; consistent with
  the UX spec; feasible and not over-engineered for a bounded local demo.

**Final confidence: 93%.** Deductions: the stack being a fixed constraint means
no real architecture risk was taken, but a few choices (classic vs. TanStack-
native tRPC integration; hand-rolled session vs. Auth.js) are judgment calls a
reviewer might weigh differently — each is documented with its trade-off so the
gate review can confirm or redirect.
