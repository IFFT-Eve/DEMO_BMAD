---
title: "Product Brief Distillate: bmad_demo"
type: llm-distillate
source: "product-brief-bmad_demo.md"
created: "2026-05-14"
purpose: "Token-efficient context for downstream PRD creation"
---

# bmad_demo — Detail Pack for PRD Creation

## Product framing
- Demo/reference e-commerce storefront, not a commercial product. Value is as a
  BMAD-method + modern-stack learning/reference build.
- Deliberately small, fixed scope. Primary risk to manage downstream is scope
  creep / over-engineering — keep epics and stories MVP-tight.

## Requirements hints (from user)
- Five MVP capability areas + setup: (1) product listing, (2) cart, (3)
  checkout, (4) shipping, (5) payment; plus (0) app setup.
- Cart must **cache cart selection** — survive page reload and navigation.
  Mechanism not yet decided (candidates: localStorage, React Query cache
  persistence, or server-side cart row). PRD/architecture should pin this down.
- **Guest mode and login mode** are both first-class.
- Guest→login cart carry-over: a cart built as a guest should persist when the
  user signs in mid-session (inferred requirement — confirm in PRD).
- Shipping is **mocked**: method + cost selection, no carrier API.
- Payment is **mocked**: payment form + order confirmation, no real charge, no
  processor, no stored card data.
- User explicitly asked for the build plan to include a **setup epic** covering
  scaffolding.

## Technical context (user-specified stack — treat as fixed constraints)
- Next.js (assume App Router unless architecture decides otherwise).
- TailwindCSS + shadcn/ui for UI.
- tRPC for type-safe API layer.
- Prisma ORM.
- SQLite database (local-first, zero-config).
- React Query (TanStack Query) for client server-state; also a candidate for
  cart cache persistence.
- End-to-end TypeScript. Local-first: should run from install + seed, no
  external accounts/keys.
- Product catalog data is seeded (no admin UI to create products).

## Detailed user scenarios
- Guest: browse list → product detail → add to cart → cart persists on reload →
  checkout (address) → pick mock shipping → mock payment → order confirmation.
- Registered: same flow, plus sign in; identity + cart persist across sessions.
- Mid-session conversion: guest builds cart, then signs in → cart retained.

## Scope signals
- IN: setup/scaffold, product list + detail, cart (add/remove/update qty,
  cached), checkout (cart review + shipping address), mock shipping (method +
  cost), mock payment (form + confirmation), auth (guest + email/password
  login), seeded products.
- OUT: real payments/processors, real shipping/carrier APIs, admin/seller
  dashboard, inventory management, search/filter/categories, recommendations,
  reviews/ratings, discounts/coupons/tax/multi-currency, email/notifications,
  password reset, social login, order history beyond current confirmation.

## Open questions for PRD / architecture
- Cart persistence mechanism: client storage vs server-side cart table vs both?
  Affects guest→login merge strategy.
- Guest→login cart merge: replace, merge, or prompt? (brief assumes "retain".)
- Auth implementation: hand-rolled session vs a library (e.g. Auth.js)? Stack
  list didn't name one.
- Product detail page: separate route or modal?
- How many seed products / categories shape, if any (categories are out of
  scope as a feature, but data may still need a shape).
- Order confirmation: persisted as an Order row, or ephemeral? (Implied
  persisted, since Prisma/SQLite are in the stack.)

## Rejected / deferred (do not re-propose for MVP)
- Real payment and shipping integrations — explicitly mocked by user decision.
- Admin panel, search, reviews, discounts, multi-currency, email — explicitly
  deferred; these are natural post-MVP epics if the project continues.
