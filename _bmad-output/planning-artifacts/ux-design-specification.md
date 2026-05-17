---
stepsCompleted: ['init', 'discovery', 'core-experience', 'design-system', 'defining-experience', 'visual-foundation', 'user-journeys', 'component-strategy', 'ux-patterns', 'responsive-accessibility', 'complete']
inputDocuments: ['prd.md', 'product-brief-bmad_demo.md']
status: 'draft'
---

# UX Design Specification — bmad_demo

**Author:** Viettung
**Date:** 2026-05-14

A focused UX specification for a bounded demo storefront. It resolves the PRD's
open UX items and gives UX-level direction the Architecture phase and the epic
breakdown can build against. It is intentionally lean — this is a reference
build, not a brand exercise.

## 1. Design Principles

- **Frictionless to a confirmed order.** Every screen's primary job is to move
  the shopper one step closer to the order confirmation. One clear primary
  action per screen.
- **Guest-first.** Nothing requires an account. Login is an option, never a
  gate. The guest and registered experiences are visually identical except for
  the account menu.
- **Honest about mocks.** Mocked shipping and payment look real but are clearly
  labelled as simulated, so the demo never misleads.
- **State-complete.** Every data-bound view defines its loading, empty, error,
  and success states — not just the happy path.
- **Stock components, lightly themed.** Use shadcn/ui primitives as-is; theming
  is limited to a token layer. No custom component library.

## 2. Resolved UX Decisions (from PRD open items)

- **UX-D1 — Product detail = dedicated route** (`/products/[id]`). Shareable,
  bookmarkable, standard. Resolves PRD D4.
- **UX-D2 — Cart = slide-over drawer**, not a separate page. The header cart
  icon opens a shadcn `Sheet` showing line items and a "Checkout" action. Avoids
  a redundant `/cart` route; satisfies FR5/FR10.
- **UX-D3 — Checkout = single route, sectioned vertical flow** (`/checkout`):
  Shipping Address → Shipping Method → Payment → Review & Place Order, with a
  sticky Order Summary panel. Sections reveal/validate in order; no multi-route
  wizard. Keeps routing and state simple for a demo.
- **UX-D4 — Order confirmation = dedicated route** (`/order/[ref]`), reachable
  only after a successful order; shows the persisted order.

## 3. Information Architecture

| Route | Screen | Auth | Primary action |
|-------|--------|------|----------------|
| `/` | Catalog (product grid) | public | Open a product / add to cart |
| `/products/[id]` | Product detail | public | Add to cart |
| `/checkout` | Checkout (sectioned) | public (guest or user) | Place order |
| `/order/[ref]` | Order confirmation | owner or guest-session | Continue shopping |
| `/login` | Log in | public | Sign in |
| `/register` | Create account | public | Register |
| (global) | App header + cart drawer | — | Navigate / open cart |

**Global header** (all routes): logo/home link · (space) · cart icon with item-count
`Badge` (opens cart drawer) · account area — "Log in" link for guests, or a
`DropdownMenu` (avatar) with "Log out" for users.

## 4. Visual Foundation

- **Tokens:** single neutral base palette + one accent (primary action) color,
  expressed as CSS variables consumed by Tailwind and shadcn theme tokens.
  Light theme only for MVP.
- **Typography:** one sans-serif family; a small type scale (display / heading /
  body / caption). System font fallback acceptable.
- **Spacing & layout:** Tailwind spacing scale; max content width container;
  catalog grid 1 col (mobile) → 2 → 3 → 4 (desktop).
- **Elevation:** flat with subtle borders; `Card` for products, `Sheet`/`Dialog`
  for overlays.

## 5. Key Journeys (screen-by-screen)

**J1 — Guest purchase:** `/` grid → click product → `/products/[id]` → "Add to
cart" (toast + header badge increments) → open cart drawer → "Checkout" →
`/checkout`: fill address → pick shipping method (cost updates summary) → fill
mock payment → "Place Order" → `/order/[ref]` confirmation.

**J2 — Registered purchase:** header "Log in" → `/login` → returns to prior page
with the saved cart intact → same as J1.

**J3 — Guest→registered conversion:** guest with items in cart → `/login` or
`/register` → on success, guest cart merges into account cart (header badge
reflects merged count) → user lands back where they were.

**J4 — Payment failure recovery:** at `/checkout` "Place Order" → mock payment
returns failure → inline error on the Payment section, order-in-progress
preserved, shopper edits/retries → success → confirmation.

## 6. Screen State Inventory

| Screen | Loading | Empty | Error | Notes |
|--------|---------|-------|-------|-------|
| Catalog | `Skeleton` product cards | "No products" message | retry banner | — |
| Product detail | skeleton detail layout | n/a (404 route for unknown id) | "Couldn't load product" + back to catalog | — |
| Cart drawer | inline spinner on line items | "Your cart is empty" + "Browse products" CTA; Checkout disabled (FR11) | toast on mutation failure, optimistic update rolled back | — |
| Checkout | section-level disabled state until cart loaded | redirect to `/` if cart empty | field-level validation errors (FR15); payment-section error block (FR23) | sticky summary always visible |
| Order confirmation | skeleton summary | n/a | "Order not found" if bad ref | — |
| Login / Register | button pending state | n/a | inline form error ("invalid credentials" / "email already used") | — |

## 7. Component Strategy (shadcn/ui)

| Area | Components |
|------|-----------|
| Layout / header | container, `Badge` (cart count), `DropdownMenu` + `Avatar` (account) |
| Catalog | `Card`, `Button`, `Skeleton` |
| Product detail | `Button`, quantity stepper (`Button` + `Input`), `Badge` (availability) |
| Cart drawer | `Sheet`, `Separator`, quantity stepper, `Button` |
| Checkout | `Form` + `Input` + `Label`, `RadioGroup` (shipping method), `Card` (sections + summary), `Button` |
| Payment (mock) | `Form` + `Input`, a visible "Simulated payment — no real charge" `Alert` |
| Confirmation | `Card`, `Separator`, `Button` |
| Auth | `Form`, `Input`, `Label`, `Button` |
| Feedback | `Sonner` toasts (add-to-cart, errors), inline `Alert` for section errors |

## 8. Interaction Patterns

- **Add to cart:** optimistic — header badge and drawer update immediately
  (NFR-P2); toast confirms; rollback + toast on failure.
- **Quantity changes:** stepper with `+ / −`; quantity 0 removes the item (with
  the option also exposed as an explicit remove control).
- **Mock labelling:** shipping methods and the payment form carry a persistent
  "simulated" `Alert`/note; confirmation page repeats it.
- **Validation:** inline, on blur and on submit; the "Place Order" button stays
  disabled until all required checkout fields are valid (FR15).
- **Auth return:** `/login` and `/register` preserve and return to the
  originating route.

## 9. Responsive & Accessibility

- **Responsive:** mobile-first. Catalog grid reflows 1→4 columns. Cart `Sheet`
  is full-width on mobile, side panel on desktop. Checkout summary moves from a
  sticky sidebar (desktop) to a collapsible top summary (mobile).
- **Accessibility (NFR-A1, WCAG 2.1 AA basics):** all inputs have associated
  `Label`s; visible focus rings on all interactive elements; cart drawer and any
  dialogs trap focus and restore it on close; full keyboard operability for
  catalog → detail → cart → checkout; color is never the only signal (icons +
  text for errors and availability); contrast meets AA. shadcn/ui primitives
  provide the baseline; the build must not regress it.

## 10. Out of UX Scope (MVP)

Dark theme, brand identity work, animation/motion design, marketing pages,
product imagery art direction, search/filter UI, account/profile/order-history
screens — all excluded, consistent with the PRD's out-of-scope list.

## Handoff Notes for Architecture

- Cart drawer + checkout both read the same cart state — the architecture's cart
  persistence decision (PRD D1) should expose one cart source consumed by both.
- `/order/[ref]` must be reachable by the guest who placed the order within
  their session, and by the owning user across sessions — informs how orders are
  scoped (PRD D3).
- Mock payment failure (FR23) needs a deterministic way to trigger the failure
  path for the demo (e.g. a sentinel card number) — call this out in the mock
  payment module design.
