# Story 3.1: Add a product to the cart

Status: done

## Story

As a visitor,
I want to add a product to my cart from the catalog or a product detail page and see the cart count update,
So that I can collect items to buy.

## Acceptance Criteria

1. **Guest cart created with opaque token cookie on first add.** When a guest with no cart adds a product, a server-side `Cart` row is created and a `guest_cart_token` cookie (HTTP-only, SameSite=Lax) is set in the response. Adding a product already in the cart increments its quantity rather than creating a duplicate row. [Source: epics.md#Story-3.1; ADR-003] ✅

2. **Header cart-count badge reflects total item count and updates optimistically.** After adding a product, the cart-count badge in the global header shows the correct total item count and updates within 200 ms. A confirmation toast is shown on success. [Source: epics.md#Story-3.1; FR10; NFR-P2] ✅

3. **Server failure rolls back optimistic update and shows error toast.** If the `cartRouter.addItem` call fails, any optimistic count change is reverted and an error toast is displayed. [Source: epics.md#Story-3.1; NFR-P2] ✅

4. **Layered data path: cartRouter → cartService.** `cartRouter.addItem` validates input with a Zod schema and delegates to `cartService.addItem`. The component does not import `db` or Prisma directly. [Source: architecture.md#ADR-002; ADR-009] ✅

5. **`npm run lint` passes with zero errors and `npm run build` succeeds.** ✅

## Tasks / Subtasks

- [x] **Task 1: Cart Zod schemas** (AC: #4)
  - [x] Created `src/lib/schemas/cart.ts` with `addItemSchema`, `updateItemSchema`, `removeItemSchema`.

- [x] **Task 2: Update tRPC context** (AC: #1)
  - [x] Added `resHeaders: Headers` to `Context` type and `createContext` signature.
  - [x] Updated `src/app/page.tsx` and `src/app/products/[id]/page.tsx` callers.
  - [x] Updated `src/app/api/trpc/[trpc]/route.ts` to pass `resHeaders` from fetch adapter.

- [x] **Task 3: Cart service** (AC: #1, #4)
  - [x] Created `src/server/services/cartService.ts` with `get`, `addItem`, `updateItem`, `removeItem`.

- [x] **Task 4: Cart router** (AC: #1, #4)
  - [x] Created `src/server/routers/cart.ts` with `get`, `addItem`, `updateItem`, `removeItem`.
  - [x] Updated `src/server/root.ts` to add `cart: cartRouter`.

- [x] **Task 5: CartProvider + Toaster** (AC: #2, #3)
  - [x] Created `src/components/cart/CartProvider.tsx`.
  - [x] Updated `src/app/layout.tsx` — wraps with `CartProvider`, renders `<Toaster />`.

- [x] **Task 6: CartIconButton** (AC: #2, #3)
  - [x] Created `src/components/cart/CartIconButton.tsx`.
  - [x] Updated `src/components/layout/AppHeader.tsx` to use `CartIconButton`.

- [x] **Task 7: AddToCartButton** (AC: #1, #2, #3, #4)
  - [x] Created `src/components/cart/AddToCartButton.tsx`.
  - [x] Updated `src/app/products/[id]/page.tsx` and `src/components/catalog/ProductCard.tsx`.

- [x] **Task 8: Lint and build** (AC: #5)
  - [x] `npm run lint` — exit 0.
  - [x] `npm run build` — succeeds.

## Files Changed

- Created: `src/lib/schemas/cart.ts`
- Created: `src/server/services/cartService.ts`
- Created: `src/server/routers/cart.ts`
- Modified: `src/server/context.ts`
- Modified: `src/server/root.ts`
- Modified: `src/app/api/trpc/[trpc]/route.ts`
- Modified: `src/app/layout.tsx`
- Modified: `src/app/page.tsx`
- Modified: `src/app/products/[id]/page.tsx`
- Created: `src/components/cart/CartProvider.tsx`
- Created: `src/components/cart/CartIconButton.tsx`
- Created: `src/components/cart/AddToCartButton.tsx`
- Modified: `src/components/layout/AppHeader.tsx`
- Modified: `src/components/catalog/ProductCard.tsx`

## Change Log

| Date | Change |
|------|--------|
| 2026-05-15 | Story 3.1 created. Status → ready-for-dev. |
| 2026-05-20 | Implemented. Status → done. |
