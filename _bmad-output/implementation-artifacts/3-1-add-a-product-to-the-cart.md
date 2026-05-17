# Story 3.1: Add a product to the cart

Status: ready-for-dev

## Story

As a visitor,
I want to add a product to my cart from the catalog or a product detail page and see the cart count update,
So that I can collect items to buy.

## Acceptance Criteria

1. **Guest cart created with opaque token cookie on first add.** When a guest with no cart adds a product, a server-side `Cart` row is created and a `guest_cart_token` cookie (HTTP-only, SameSite=Lax) is set in the response. Adding a product already in the cart increments its quantity rather than creating a duplicate row. [Source: epics.md#Story-3.1; ADR-003]

2. **Header cart-count badge reflects total item count and updates optimistically.** After adding a product, the cart-count badge in the global header shows the correct total item count and updates within 200 ms. A confirmation toast is shown on success. [Source: epics.md#Story-3.1; FR10; NFR-P2]

3. **Server failure rolls back optimistic update and shows error toast.** If the `cartRouter.addItem` call fails, any optimistic count change is reverted and an error toast is displayed. [Source: epics.md#Story-3.1; NFR-P2]

4. **Layered data path: cartRouter → cartService.** `cartRouter.addItem` validates input with a Zod schema and delegates to `cartService.addItem`. The component does not import `db` or Prisma directly. [Source: architecture.md#ADR-002; ADR-009]

5. **`npm run lint` passes with zero errors and `npm run build` succeeds.** [Source: CLAUDE.md#1, #2]

## Tasks / Subtasks

- [ ] **Task 1: Cart Zod schemas** (AC: #4)
  - [ ] Create `src/lib/schemas/cart.ts` with `addItemSchema`, `updateItemSchema`, `removeItemSchema`.

- [ ] **Task 2: Update tRPC context** (AC: #1)
  - [ ] Add `resHeaders: Headers` to `Context` type and `createContext` signature so the router can set cookies.
  - [ ] Update all `appRouter.createCaller(...)` call sites in Server Components to pass `resHeaders: new Headers()`.

- [ ] **Task 3: Cart service** (AC: #1, #4)
  - [ ] Create `src/server/services/cartService.ts` with `getOrCreateCart`, `addItem`, `get`.

- [ ] **Task 4: Cart router** (AC: #1, #4)
  - [ ] Create `src/server/routers/cart.ts` with `addItem` (sets Set-Cookie via `ctx.resHeaders` on new token) and `get` procedures.
  - [ ] Update `src/server/root.ts` to add `cart: cartRouter`.

- [ ] **Task 5: CartProvider + Toaster** (AC: #2, #3)
  - [ ] Create `src/components/cart/CartProvider.tsx` — Client Component providing drawer open state and `pendingCount` for optimistic badge.
  - [ ] Update `src/app/layout.tsx` to wrap with `CartProvider` and render `<Toaster />`.

- [ ] **Task 6: CartIconButton** (AC: #2, #3)
  - [ ] Create `src/components/cart/CartIconButton.tsx` — Client Component querying `trpc.cart.get`, displaying `serverCount + pendingCount` as badge.
  - [ ] Update `src/components/layout/AppHeader.tsx` to use `CartIconButton`.

- [ ] **Task 7: AddToCartButton** (AC: #1, #2, #3, #4)
  - [ ] Create `src/components/cart/AddToCartButton.tsx` — Client Component with `trpc.cart.addItem.useMutation`, optimistic count via `pendingCount`, toast on success/error.
  - [ ] Update `src/app/products/[id]/page.tsx` to include `<AddToCartButton productId={product.id} inStock={product.stock > 0} />`.

- [ ] **Task 8: Lint and build** (AC: #5)
  - [ ] Run `npm run lint` — exit 0.
  - [ ] Run `npm run build` — succeeds.

## Dev Notes

### Cookie setting via tRPC fetch adapter
The tRPC `fetchRequestHandler` automatically passes `resHeaders: Headers` to `createContext`. Adding `resHeaders` to the `Context` type lets cart procedures call `ctx.resHeaders.append('Set-Cookie', ...)` to set the guest token cookie on the HTTP response.

### Optimistic update approach
Rather than manipulating the full cart query cache (which requires complete product data), `CartProvider` tracks a `pendingCount` integer. `AddToCartButton` increments it in `onMutate` and decrements in `onSettled`. `CartIconButton` displays `serverCount + pendingCount`. This is type-safe and satisfies the 200 ms AC.

### Server Component callers
All `appRouter.createCaller(ctx)` calls in Server Components must now include `resHeaders: new Headers()`. Headers set this way are harmless — they are never sent by Server Component rendering paths.

## Change Log

| Date | Change |
|------|--------|
| 2026-05-15 | Story 3.1 created. Status → ready-for-dev. |
