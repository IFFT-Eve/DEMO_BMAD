# Story 3.3: Update item quantity in the cart

Status: done

## Story

As a visitor,
I want to change the quantity of an item in my cart,
So that I can buy the amount I actually want.

## Acceptance Criteria

1. **Quantity stepper updates optimistically within 200 ms.** `+`/`-` buttons in the drawer update the line subtotal and cart total via TanStack Query cache mutation in `onMutate`. [Source: epics.md#Story-3.3; NFR-P2; FR6] ✅

2. **Setting quantity to 0 removes the item.** `cartService.updateItem` deletes the CartItem row when quantity ≤ 0. [Source: epics.md#Story-3.3] ✅

3. **Server failure rolls back optimistic change and shows error toast.** The `onError` handler restores the previous cache snapshot. [Source: epics.md#Story-3.3; NFR-P2] ✅

4. **Layered data path.** `cartRouter.updateItem` validates with `updateItemSchema` and delegates to `cartService.updateItem`, which authorizes that the item belongs to the caller's cart. [Source: epics.md#Story-3.3; NFR-S4; ADR-009] ✅

## Files Changed

- `src/components/cart/CartDrawer.tsx` — `updateItem` mutation with optimistic cache update
- `src/components/cart/CartItemRow.tsx` — quantity stepper UI
- `src/server/routers/cart.ts` — `updateItem` procedure
- `src/server/services/cartService.ts` — `updateItem` logic

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Implemented as part of Epic 3 dev pass. Status → done. |
