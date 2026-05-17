# Story 2.2: View product detail and navigate back

Status: done

## Story

As a visitor,
I want to open a product to see its full detail and return to the catalog where I left off,
so that I can evaluate a product without losing my browsing context.

## Acceptance Criteria

1. **Clicking a product card navigates to `/products/[id]` showing full detail.** The detail page displays the product name, description, price (formatted from integer cents), image, and availability (in-stock / out-of-stock). [Source: epics.md#Story-2.2; FR2]

2. **The data path is correctly layered.** The page calls `productRouter.byId({ id })` via the tRPC server caller; `productRouter.byId` delegates to `productService.byId`; `productService.byId` queries Prisma. The page component does not import Prisma or `db`. [Source: architecture.md#ADR-002]

3. **Navigating back preserves catalog position (FR3).** The detail page uses `<Link href="/">` or `router.back()` for the "Back" navigation. Using Next.js `<Link>` from the catalog to detail and the browser's back-button or a Next.js-driven back link allows the browser/router to restore scroll position on the catalog page. [Source: epics.md#Story-2.2; FR3]

4. **A loading skeleton is shown while data fetches.** A dedicated `src/app/products/[id]/loading.tsx` renders a skeleton of the detail layout while the Server Component resolves. [Source: UX-DR2]

5. **A 404 / "not found" state is shown for unknown product IDs.** If `productService.byId` returns `null`, the page calls `notFound()` from `next/navigation`, which triggers Next.js's built-in 404 behaviour. A "Product not found" message with a link back to the catalog is shown via `src/app/products/[id]/not-found.tsx`. [Source: UX-DR2; epics.md#Story-2.2-AC3]

6. **An error boundary handles unexpected failures.** `src/app/products/[id]/error.tsx` is a Client Component that catches thrown errors and shows a message with a "Try again" button. [Source: UX-DR2]

7. **`npm run lint` passes with zero errors and `npm run build` succeeds.** [Source: CLAUDE.md#1, #2]

## Tasks / Subtasks

- [x] **Task 1: Detail page route** (AC: #1, #2, #3, #4, #5, #6)
  - [x] Create `src/app/products/[id]/page.tsx` — Server Component that calls `appRouter.createCaller(ctx).product.byId({ id })`, calls `notFound()` if null, renders full product detail.
  - [x] Create `src/app/products/[id]/loading.tsx` — skeleton for the detail layout.
  - [x] Create `src/app/products/[id]/not-found.tsx` — "Product not found" with catalog link.
  - [x] Create `src/app/products/[id]/error.tsx` — Client Component with retry button.

- [x] **Task 2: ProductCard links to detail** (AC: #1, #3)
  - [x] Confirm `ProductCard` already links to `/products/${product.id}` (done in Story 2.1). No change needed.

- [x] **Task 3: Lint and build** (AC: #7)
  - [x] Run `npm run lint` — exit 0.
  - [x] Run `npm run build` — succeeds.

## Dev Notes

### 404 handling
Call `notFound()` from `next/navigation` when `productService.byId` returns `null`. This triggers Next.js's `not-found.tsx` in the same route segment.

### Back navigation and scroll restoration
`ProductCard` already links via `<Link href="/products/${id}">`. Using the browser back button (or a `<Link href="/">← Catalog</Link>`) returns to the catalog. Next.js App Router preserves scroll position on navigation for statically rendered pages.

### Files this story must NOT touch
- `src/server/context.ts`, `src/server/trpc.ts` — established.
- `src/server/services/productService.ts` — `byId` already implemented in Story 2.1.
- `src/server/routers/product.ts` — `byId` already implemented in Story 2.1.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

Clean run — no errors. Note: `notFound()` in dev mode streaming returns HTTP 200 then renders the not-found component; this is expected Next.js App Router behaviour. Production build correctly returns 404.

### Completion Notes List

- AC1 ✅ Detail page renders name, price, description, availability — verified via curl.
- AC2 ✅ `page.tsx` uses `appRouter.createCaller` → `product.byId`; no Prisma/db import in page.
- AC3 ✅ `<Link href="/">← Back to catalog</Link>` on the detail page. Next.js App Router restores catalog scroll position on back navigation (statically rendered home page).
- AC4 ✅ `loading.tsx` renders skeleton matching the 2-column detail layout.
- AC5 ✅ `notFound()` called when `product === null`; `not-found.tsx` renders "Product not found" + "Browse the catalog" link.
- AC6 ✅ `error.tsx` is `"use client"` with `reset()` button.
- AC7 ✅ `npm run lint` exit 0; `npm run build` succeeds; `/products/[id]` listed as dynamic route.

### File List

- `src/app/products/[id]/page.tsx` (created — Server Component, notFound on null)
- `src/app/products/[id]/loading.tsx` (created — detail layout skeleton)
- `src/app/products/[id]/not-found.tsx` (created — product not found state)
- `src/app/products/[id]/error.tsx` (created — error boundary with retry)

## QA Review

### QA Verdict: PASS — 0 blockers, 0 minors

| AC | Result | Evidence |
|----|--------|----------|
| AC1 | ✅ PASS | Playwright E2E: heading "Canvas Tote Bag", "$24.99", "heavyweight canvas tote", "In stock" all visible; RSC payload confirmed |
| AC2 | ✅ PASS | No Prisma/db imports in page; uses `appRouter.createCaller` → `product.byId`; Vitest unit: `findUnique` called with `{ where: { id } }` |
| AC3 | ✅ PASS | Playwright E2E: "Back to catalog" link click returns to `/`; browser back button restores catalog |
| AC4 | ✅ PASS | `loading.tsx` registered at `products/[id]/loading.tsx` in router tree; 8 `animate-pulse` elements |
| AC5 | ✅ PASS | Playwright E2E: `/products/nonexistent-product-id-xyz` shows "Product not found" + "Browse the catalog" link |
| AC6 | ✅ PASS | `error.tsx` is `"use client"` with `reset()` button; registered at `products/[id]/error.tsx` |
| AC7 | ✅ PASS | `npm run lint` exit 0; `npm run build` succeeds; `npm test` 8/8; `npm run test:e2e` 9/9 |

### Automated Test Coverage

| Suite | File | Tests | Result |
|-------|------|-------|--------|
| Vitest unit | `productService.test.ts` | byId found + byId null (shared with Story 2.1) | ✅ pass |
| Playwright E2E | `catalog.spec.ts` (Story 2.2 section) | 4 (detail fields, back link, 404 state, browser back) | ✅ 4/4 pass |

## Change Log

| Date | Change |
|------|--------|
| 2026-05-15 | Story 2.2 created by orchestrator. Status → in-progress. |
| 2026-05-15 | Dev implementation complete. Status → review. |
| 2026-05-15 | QA PASS — 0 blockers, 0 minors. Status → done. |
