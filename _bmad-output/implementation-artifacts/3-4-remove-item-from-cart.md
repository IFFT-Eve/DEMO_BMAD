# Story 3.4: Remove an item from the cart

Status: done

## Story

As a visitor,
I want an explicit control to remove an item from my cart,
So that I can take something out without fiddling with the quantity.

## Acceptance Criteria

1. **Remove control removes item optimistically within 200 ms.** The `×` button removes the item from the drawer, recalculates totals, and updates the header badge via TanStack Query cache mutation. [Source: epics.md#Story-3.4; NFR-P2; FR7] ✅

2. **Server failure rolls back optimistic removal and shows error toast.** The `onError` handler restores the previous cache snapshot. [Source: epics.md#Story-3.4; NFR-P2] ✅

3. **Layered data path.** `cartRouter.removeItem` validates with `removeItemSchema` and delegates to `cartService.removeItem`, which authorizes that the item belongs to the caller's cart. [Source: epics.md#Story-3.4; NFR-S4; ADR-009] ✅

## Files Changed

- `src/components/cart/CartDrawer.tsx` — `removeItem` mutation with optimistic cache update
- `src/components/cart/CartItemRow.tsx` — remove button (X icon)
- `src/server/routers/cart.ts` — `removeItem` procedure
- `src/server/services/cartService.ts` — `removeItem` logic

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Implemented as part of Epic 3 dev pass. Status → done. |
