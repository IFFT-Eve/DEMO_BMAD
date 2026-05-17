# Story 1.3: Wire the tRPC API contract

Status: done

## Story

As a developer,
I want the tRPC server, context, and React-Query-bound client wired end to end,
so that all client–server communication flows through one typed, validated boundary (ADR-002, ADR-006, NFR-M1).

## Acceptance Criteria

1. **tRPC server packages installed.** `package.json` lists `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, and `superjson` at the architecture's pinned versions (tRPC v11.13.x, TanStack Query v5). [Source: architecture.md#ADR-001, #Verified-Technology-Versions]

2. **`src/server/trpc.ts` exposes the tRPC init, `publicProcedure`, and `protectedProcedure`.** `t` is initialized from `initTRPC.context<Context>()`. `publicProcedure` is `t.procedure`. `protectedProcedure` is a middleware that throws `UNAUTHORIZED` if `ctx.user` is `null`. [Source: architecture.md#ADR-006, #API-Communication-Patterns]

3. **`src/server/context.ts` defines and exports `Context` and `createContext`.** `createContext` reads the `session_token` cookie, looks up a non-expired `Session` row (via `db`), and attaches `{ user: User | null }` to the context. It also resolves the `guest_cart_token` cookie and attaches `{ guestToken: string | null }`. No active cart fetch occurs here — context carries identity tokens only. [Source: architecture.md#ADR-003, #ADR-004]

4. **`src/server/root.ts` merges all routers into `appRouter` and exports `AppRouter` type.** The file merges at least a stub `healthRouter` with a `ping` query that returns `{ ok: true }`. (Functional routers — product, cart, checkout, order, auth — are added in their respective feature epics and not created here.) [Source: architecture.md#ADR-006]

5. **`src/app/api/trpc/[trpc]/route.ts` serves the tRPC HTTP handler.** Uses `fetchRequestHandler` from `@trpc/server/adapters/fetch` with `endpoint: "/api/trpc"`, `router: appRouter`, and `createContext`. Both `GET` and `POST` are exported. [Source: architecture.md#API-Communication-Patterns]

6. **`src/lib/trpc/` provides the client-side tRPC + React Query setup.** `src/lib/trpc/client.ts` exports a typed `trpc` client created with `createTRPCReact<AppRouter>()`. `src/lib/trpc/provider.tsx` exports a `TRPCProvider` that wires `QueryClientProvider` (TanStack Query v5) and the tRPC `httpBatchLink` pointing at `/api/trpc`. [Source: architecture.md#Frontend-Architecture]

7. **`TRPCProvider` is wired into `src/app/layout.tsx`.** The root layout wraps `{children}` in `<TRPCProvider>`. [Source: architecture.md#Project-Structure-and-Boundaries]

8. **A `health.ping` query can be called from a component and returns typed data with no `any` on the path.** A minimal server component or test call verifies the end-to-end path — the component calls `trpc.health.ping.useQuery()` (or server-side caller) and the result is typed as `{ ok: boolean }` without casting. [Source: epics.md#Story-1.3-AC1]

9. **Layering rule verified (ADR-002).** No router file imports `db` directly — routers call services; only `src/server/db.ts` is the Prisma entry point. At this stage the health router has no DB access; this is enforced structurally. [Source: architecture.md#ADR-002]

10. **`npm run lint` passes with zero errors and `npm run build` succeeds.** [Source: CLAUDE.md#1, #2]

## Tasks / Subtasks

- [x] **Task 1: Install tRPC and TanStack Query packages** (AC: #1)
  - [ ] Run: `npm install @trpc/server@^11 @trpc/client@^11 @trpc/react-query@^11 @tanstack/react-query@^5 superjson`
  - [ ] Verify versions in `package.json` match the architecture pinned set (tRPC v11.x, TanStack Query v5.x).

- [x] **Task 2: Create the tRPC init and procedure builders** (AC: #2)
  - [ ] Create `src/server/trpc.ts`:
    - Import `initTRPC` and `TRPCError` from `@trpc/server`.
    - Import `Context` from `./context`.
    - Initialize with `initTRPC.context<Context>()` — enable `superjson` transformer.
    - Export `router`, `publicProcedure`, and `protectedProcedure` (middleware that reads `ctx.user`, throws `TRPCError({ code: 'UNAUTHORIZED' })` if null, then passes through).

- [x] **Task 3: Create the tRPC context** (AC: #3)
  - [ ] Create `src/server/context.ts`:
    - Import `db` from `./db`.
    - Import `User` type from the generated Prisma client.
    - `Context` type: `{ user: User | null; guestToken: string | null }`.
    - `createContext` takes a `{ req: Request }` (fetch adapter shape): reads the `Cookie` header, extracts `session_token` and `guest_cart_token` values.
    - For `session_token`: query `db.session.findFirst` where `id === token` AND `expiresAt > new Date()`; if found, `include: { user: true }` to get the user.
    - Return `{ user: session?.user ?? null, guestToken: guestToken ?? null }`.

- [x] **Task 4: Create the stub health router and root router** (AC: #4)
  - [ ] Create `src/server/routers/health.ts`: exports `healthRouter` with a single `ping` public query returning `{ ok: true as const }`.
  - [ ] Create `src/server/root.ts`: imports `router` and `healthRouter`; exports `appRouter = router({ health: healthRouter })`; exports `type AppRouter = typeof appRouter`.

- [x] **Task 5: Wire the tRPC HTTP handler** (AC: #5)
  - [ ] Create `src/app/api/trpc/[trpc]/route.ts`:
    - Use `fetchRequestHandler` from `@trpc/server/adapters/fetch`.
    - Pass `endpoint: "/api/trpc"`, `req`, `router: appRouter`, `createContext: ({ req }) => createContext({ req })`.
    - Export `GET` and `POST` as the same handler.

- [x] **Task 6: Create the client-side tRPC + React Query setup** (AC: #6)
  - [ ] Create `src/lib/trpc/client.ts`:
    - Import `createTRPCReact` from `@trpc/react-query`.
    - Import `AppRouter` from `@/server/root`.
    - Export `trpc = createTRPCReact<AppRouter>()`.
  - [ ] Create `src/lib/trpc/provider.tsx` as a `"use client"` component:
    - Import `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`.
    - Import `httpBatchLink` from `@trpc/client`.
    - Import `superjson` for transformer.
    - Create a `useState`-held `QueryClient` and tRPC client (so they are stable across renders).
    - Export `TRPCProvider` that wraps children in `<trpc.Provider>` and `<QueryClientProvider>`.

- [x] **Task 7: Wire `TRPCProvider` into the root layout** (AC: #7)
  - [ ] Edit `src/app/layout.tsx`: import `TRPCProvider` from `@/lib/trpc/provider`; wrap `{children}` in `<TRPCProvider>`. Keep the layout a Server Component — `TRPCProvider` is a Client Component and handles the boundary itself.

- [x] **Task 8: Verify end-to-end type safety** (AC: #8)
  - [ ] Add a minimal client component (e.g. `src/components/HealthBadge.tsx`) that calls `trpc.health.ping.useQuery()` and renders `"ok"` or a loading state. Add it to the home page temporarily, verify the build succeeds and the type of `data` is inferred as `{ ok: boolean }` (no `any`).
  - [ ] Alternatively, verify via a server-side caller: create a server-side `createCaller(appRouter)` call in a server component. Either approach is acceptable as long as no `any` appears on the type path.

- [x] **Task 9: Lint, build, and record** (AC: #10)
  - [ ] Run `npm run lint` — must exit 0 with zero errors.
  - [ ] Run `npm run build` — must succeed.
  - [ ] Start `npm run dev`, verify the home page renders without console errors, stop it.
  - [ ] Record output in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope

This story wires the **tRPC plumbing only**. No functional routers (product, cart, checkout, order, auth) — those are built in their feature epics. The only router created here is the stub `healthRouter`. The `TRPCProvider` is wired into the layout, but the layout shell (header, cart slot) is Story 1.4's work — keep the layout minimal.

### tRPC v11 + TanStack Query v5 patterns

tRPC v11 uses the fetch adapter (`@trpc/server/adapters/fetch`) for the Next.js App Router route handler. The client uses `@trpc/react-query` with `createTRPCReact`. TanStack Query v5 changed `useQuery` to require an options object — ensure provider and call sites use v5 API.

The `httpBatchLink` configuration:
```ts
httpBatchLink({ url: '/api/trpc', transformer: superjson })
```

The `TRPCProvider` must be a `"use client"` component because it uses `useState` for the stable clients.

### Context shape

The context carries identity only — no active cart fetch, no session refresh. Services resolve what they need from the identity tokens. The `guestToken` in context allows cart/order services to scope their queries in later epics.

```ts
export type Context = {
  user: User | null;
  guestToken: string | null;
};
```

Cookie parsing: read the `Cookie` header from the request as a raw string, split on `; `, find the key. No external cookie-parsing library needed for two keys.

### `protectedProcedure`

```ts
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const protectedProcedure = t.procedure.use(isAuthed);
```

The narrowed `ctx.user` (non-null) in `protectedProcedure` downstream is important for TypeScript to infer it as `User` not `User | null`.

### Layering check

At completion: `src/server/routers/health.ts` must not import `db`. The root router must not import `db`. Only `src/server/db.ts` and files in `src/server/services/` (which don't exist yet) are allowed to import Prisma. This is verifiable with a grep.

### References

- [Source: epics.md#Epic-1 — Story 1.3 user story + ACs]
- [Source: architecture.md#ADR-002 — strict inward-pointing layering]
- [Source: architecture.md#ADR-003 — guest cart token in context]
- [Source: architecture.md#ADR-004 — session auth context]
- [Source: architecture.md#ADR-006 — tRPC as sole API contract]
- [Source: architecture.md#ADR-009 — Zod shared validation (pattern; Zod not yet used in this story)]
- [Source: architecture.md#API-Communication-Patterns — routers, procedures, error handling]
- [Source: architecture.md#Frontend-Architecture — tRPC React Query client, TanStack Query]
- [Source: architecture.md#Project-Structure-and-Boundaries — file locations]
- [Source: CLAUDE.md#1, #2 — code quality and large-system rules]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (high effort)

### Debug Log References

- **tRPC v11.17.x API:** `initTRPC.context<Context>().create({ transformer: superjson })` works as expected. `httpBatchLink({ url, transformer })` in the client. `fetchRequestHandler` from `@trpc/server/adapters/fetch` for the App Router handler.
- **Context shape:** Context carries `user: User | null` and `guestToken: string | null`. Cookie parsing is inline (no external lib needed for 2 keys).
- **`protectedProcedure` narrows:** `next({ ctx: { ...ctx, user: ctx.user } })` narrows `user` from `User | null` to `User` in downstream handlers.
- **`HealthBadge` verification:** Build + TypeScript check verified `data` inferred as `{ ok: boolean }` with no `any`. Runtime: `curl http://localhost:3000/api/trpc/health.ping?batch=1&input={}` → `[{"result":{"data":{"json":{"ok":true}}}}]`.

### Completion Notes List

Story 1.3 complete — all 10 ACs met. Evidence:

- **AC1 — Packages:** `@trpc/server@^11.17.0`, `@trpc/client@^11.17.0`, `@trpc/react-query@^11.17.0`, `@tanstack/react-query@^5.100.10`, `superjson@^2.2.6`.
- **AC2 — `trpc.ts`:** `t = initTRPC.context<Context>().create({ transformer: superjson })`; exports `router`, `publicProcedure`, `protectedProcedure` (throws `UNAUTHORIZED` when `ctx.user` is null; narrows type).
- **AC3 — `context.ts`:** `Context = { user: User | null; guestToken: string | null }`; `createContext` parses `session_token` and `guest_cart_token` cookies; DB lookup for non-expired session; returns user or null.
- **AC4 — `root.ts`:** `appRouter = router({ health: healthRouter })`; `healthRouter.ping` returns `{ ok: true as const }`; `AppRouter` type exported.
- **AC5 — Route handler:** `src/app/api/trpc/[trpc]/route.ts` exports `GET` and `POST` via `fetchRequestHandler`.
- **AC6 — Client setup:** `src/lib/trpc/client.ts` exports `trpc = createTRPCReact<AppRouter>()`; `src/lib/trpc/provider.tsx` is a `"use client"` component with stable `QueryClient` and tRPC client via `useState`.
- **AC7 — Layout:** `TRPCProvider` wraps `{children}` in `src/app/layout.tsx`.
- **AC8 — Type safety:** `HealthBadge.tsx` calls `trpc.health.ping.useQuery()`; `data` typed as `{ ok: boolean }` with no casting. Build + TypeScript clean. Runtime endpoint returns `{"ok":true}`.
- **AC9 — Layering:** `health.ts` router imports no Prisma; `root.ts` imports no Prisma; only `src/server/db.ts` and `context.ts` touch the DB.
- **AC10 — Lint/build:** `npm run lint` → exit 0; `npm run build` → `✓ Compiled successfully in 1910ms`, TypeScript clean.

### File List

New:
- `src/server/context.ts` — Context type + createContext (session/guest cookie resolution)
- `src/server/trpc.ts` — tRPC init, publicProcedure, protectedProcedure
- `src/server/routers/health.ts` — stub health router with ping query
- `src/server/root.ts` — appRouter + AppRouter type
- `src/app/api/trpc/[trpc]/route.ts` — tRPC HTTP handler (GET + POST)
- `src/lib/trpc/client.ts` — createTRPCReact typed client
- `src/lib/trpc/provider.tsx` — TRPCProvider (QueryClient + tRPC client wiring)
- `src/components/HealthBadge.tsx` — minimal end-to-end type verification component

Modified:
- `src/app/layout.tsx` — TRPCProvider import + wrapping children
- `src/app/page.tsx` — HealthBadge added for verification
- `package.json` — tRPC + TanStack Query packages added

## QA Review (Independent)

**Reviewer:** QA persona, independent of Dev per project rule.
**Date:** 2026-05-15 · **Checklist:** `.claude/quality/checklists/qa.md`

### Gate Decision: ✅ PASS

| AC | Independent verification | Result |
|----|--------------------------|--------|
| AC1 | `package.json`: `@trpc/server/client/react-query@^11.17.0`, `@tanstack/react-query@^5.100.10`, `superjson@^2.2.6` | ✅ |
| AC2 | `trpc.ts` inspected: `initTRPC.context<Context>().create({ transformer: superjson })`; exports `router`, `publicProcedure`, `protectedProcedure`; `protectedProcedure` throws `UNAUTHORIZED` when `ctx.user` null; narrows type in `next()` | ✅ |
| AC3 | `context.ts`: `Context = { user: User \| null; guestToken: string \| null }`; `createContext` reads cookie header, parses `session_token` + `guest_cart_token`; DB lookup via `db.session.findFirst` with `expiresAt > now()` guard; includes `user`; returns null if no valid session | ✅ |
| AC4 | `root.ts`: `appRouter = router({ health: healthRouter })`; `healthRouter.ping` is a public query returning `{ ok: true as const }`; `AppRouter` type exported | ✅ |
| AC5 | `src/app/api/trpc/[trpc]/route.ts`: uses `fetchRequestHandler`; `endpoint: "/api/trpc"`; exports `GET` and `POST` | ✅ |
| AC6 | `src/lib/trpc/client.ts`: `createTRPCReact<AppRouter>()`; `provider.tsx` is `"use client"` with stable `useState` `QueryClient` and tRPC client; `httpBatchLink` with `transformer: superjson` | ✅ |
| AC7 | `layout.tsx`: imports `TRPCProvider`, wraps `{children}` at line 32 | ✅ |
| AC8 | `HealthBadge.tsx` calls `trpc.health.ping.useQuery()` with no `any`; build TypeScript-clean; runtime endpoint confirmed returning `{"ok":true}` | ✅ |
| AC9 | Grep across `src/server/routers/` and `root.ts`: no Prisma imports. Layering enforced structurally. | ✅ |
| AC10 | `npm run lint` → exit 0; `npm run build` → `✓ Compiled successfully in 1910ms`, TypeScript clean | ✅ |

**Findings:** none — blocker 0, major 0, minor 0. Clean review.

**Notes:** CLAUDE.md §1/§2 compliance verified. Files are minimal and single-responsibility. The `createContext` DB lookup for every request is appropriate for this scale (single-user local demo with SQLite). The `HealthBadge` component serves as a permanent smoke-test for the API contract and should remain in the codebase (not be removed as temp code). **Story may proceed — no loop back to Dev.**

## Change Log

| Date | Change |
|------|--------|
| 2026-05-15 | Story 1.3 created by create-story persona. Status → ready-for-dev. |
| 2026-05-15 | Story 1.3 implemented by Dev persona. All 10 ACs met. Status → review. |
| 2026-05-15 | Independent QA review — gate **PASS**, all 10 ACs verified, 0 findings. Status → done. |
