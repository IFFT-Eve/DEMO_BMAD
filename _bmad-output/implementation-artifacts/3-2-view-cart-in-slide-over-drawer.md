# Story 3.2: View the cart in a slide-over drawer

Status: done

## Story

As a visitor,
I want to open a cart drawer showing my line items and totals,
So that I can review what I'm about to buy from anywhere in the app.

## Acceptance Criteria

1. **Slide-over drawer opens showing line items, subtotals, and cart total.** Clicking the header cart icon opens a `Sheet` with each item's quantity, subtotal (qty × price), the overall cart total, and a "Checkout" action. [Source: epics.md#Story-3.2; FR5] ✅

2. **Cart persists across reload and navigation.** Cart contents are read from the server via `cartService.get` keyed by `guest_cart_token`; reloading or navigating preserves the cart. [Source: epics.md#Story-3.2; FR8] ✅

3. **Empty cart state shown.** When the cart has no items, an "Your cart is empty" state with a "Browse products" CTA is displayed. [Source: epics.md#Story-3.2; UX-DR2] ✅

4. **Drawer is responsive.** Full-width on mobile, side panel on desktop (controlled by Sheet's `sm:max-w-sm` sizing). [Source: epics.md#Story-3.2; UX-DR4] ✅

5. **Focus trapped in drawer; restored on close.** base-ui Dialog handles focus trapping and restoration natively. [Source: epics.md#Story-3.2; UX-DR3] ✅

## Files Changed

- Created: `src/components/cart/CartDrawer.tsx`
- Created: `src/components/cart/CartItemRow.tsx`
- (CartProvider.tsx renders CartDrawer — see Story 3.1)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Implemented as part of Epic 3 dev pass. Status → done. |
