# Story 3.5: Prevent checkout from an empty cart

Status: done

## Story

As a visitor,
I want the app to stop me from starting checkout with an empty cart,
So that I never reach a meaningless checkout flow.

## Acceptance Criteria

1. **"Checkout" action disabled when cart is empty.** The `SheetFooter` with the Checkout button is only rendered when the cart has items; the empty state shows no checkout path. [Source: epics.md#Story-3.5; FR11] ✅

2. **Direct navigation to `/checkout` with empty cart redirects to catalog.** `src/app/checkout/page.tsx` reads the guest token cookie, fetches the cart via `cartService.get`, and calls `redirect("/")` if empty. [Source: epics.md#Story-3.5; FR11] ✅

3. **"Checkout" action is enabled when cart has at least one item.** When `cart.items.length > 0`, the footer with the Checkout button is rendered and the link is active. [Source: epics.md#Story-3.5] ✅

## Files Changed

- `src/components/cart/CartDrawer.tsx` — conditional footer (Checkout only when cart non-empty)
- Created: `src/app/checkout/page.tsx` — server-side empty-cart redirect guard

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Implemented as part of Epic 3 dev pass. Status → done. |
