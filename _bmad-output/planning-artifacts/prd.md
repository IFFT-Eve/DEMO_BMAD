---
stepsCompleted: ['discovery', 'vision', 'executive-summary', 'success', 'journeys', 'domain', 'innovation', 'project-type', 'scoping', 'functional', 'nonfunctional', 'polish', 'complete']
inputDocuments: ['product-brief-bmad_demo.md', 'product-brief-bmad_demo-distillate.md']
workflowType: 'prd'
status: 'validated'
---

# Product Requirements Document - bmad_demo

**Author:** Viettung
**Date:** 2026-05-14

## Executive Summary

`bmad_demo` is a small, self-contained e-commerce storefront built as a BMAD-method
reference implementation on a modern full-stack TypeScript architecture. A shopper
browses a product catalog, builds a cart that survives reloads and navigation, and
completes a checkout with mocked shipping and payment — as a guest or as a
registered user. It is a learning and reference artifact, not a commercial store:
the value is a complete, demonstrable purchase journey with zero external
integrations, bounded tightly enough to plan, build, and review in full.

## Vision

If successful, `bmad_demo` becomes a reusable BMAD reference template — a
known-good starting point others fork to learn the method or to bootstrap a real
storefront by swapping the mocked shipping/payment layers for real providers and
promoting deferred items (search, admin, discounts, order history) into their own
epics.

## Success Criteria

- **SC1:** All five flows work end-to-end: product list → cart → checkout →
  (mock) shipping → (mock) payment → order confirmation.
- **SC2:** Cart selection persists across a page reload and across in-app
  navigation.
- **SC3:** Both guest and logged-in modes reach a completed (mock) order.
- **SC4:** A guest who builds a cart and then signs in keeps that cart (merged
  into their account cart).
- **SC5:** The app runs locally from a single setup epic — `install → seed →
  run` — with no external accounts, keys, or services.
- **SC6:** The codebase follows `CLAUDE.md` standards: clean code, layered
  structure, end-to-end type safety via tRPC + Prisma.
- **SC7:** A simulated payment failure is handled gracefully and is recoverable
  by the shopper.

## User Journeys

**J1 — Guest purchase.** A visitor lands on the catalog, opens a product, adds it
to the cart, adjusts quantity, proceeds to checkout, enters a shipping address,
picks a mocked shipping method, fills the mocked payment form, places the order,
and sees an order confirmation — never creating an account.

**J2 — Registered purchase.** A returning user logs in, finds their previously
saved cart still intact, and completes checkout as in J1. Their session persists
across reloads.

**J3 — Guest-to-registered conversion.** A guest builds a cart, then registers or
logs in mid-session. Their guest cart is merged into their account cart and the
checkout continues uninterrupted.

**J4 — Recovered payment failure.** During checkout the mocked payment returns a
failure; the shopper sees a clear error, corrects details or retries, and
completes the order.

## Project Type & Technical Constraints

Type: full-stack web application, local-first, single-deployment. The technology
stack is a **fixed constraint** specified by the product owner:

- **Next.js** (App Router) — frontend and server
- **TailwindCSS** + **shadcn/ui** — UI layer
- **tRPC** — type-safe client/server API contracts
- **Prisma** ORM over **SQLite** — persistence
- **React Query** (TanStack Query) — client server-state and cart sync
- End-to-end **TypeScript**

The application must run with no external services: payment and shipping are
mocked, the database is local SQLite, and product data is seeded.

## Scope

### In Scope (MVP)

- Application setup & scaffolding (the stack above; seeded product data).
- Product catalog: browse list, view product detail.
- Shopping cart: add / remove / update quantity; persistent cart; cart indicator.
- Checkout: order review, shipping address entry, field validation.
- Shipping (mocked): method selection, cost, delivery estimate.
- Payment & order (mocked): mock payment form, simulated authorization, order
  placement, order confirmation, simulated-failure path.
- User accounts & sessions: guest mode, registration, login/logout, persistent
  session, guest-cart merge on login.

### Out of Scope (explicitly not MVP)

Real payment processing or providers; real shipping/carrier APIs or live rates;
admin/seller dashboard; inventory management and fulfillment; product
search/filter/categories/recommendations; reviews and ratings; discounts,
coupons, tax, multi-currency; email and notifications; password reset; social
login; order history beyond the just-completed confirmation.

## Key Decisions & Assumptions

These resolve the open questions raised in the Product Brief. Items marked
**(architecture)** fix the requirement here and defer the mechanism to the
Architecture phase.

- **D1 — Cart persistence (architecture).** Requirement: a cart persists across
  reload and navigation for everyone, and across sessions for logged-in users
  (FR8, FR9). The brief's candidate mechanisms (client storage vs. server-side
  cart table) are deferred; a server-side cart in SQLite is the leading option
  because it also makes D2 a server operation.
- **D2 — Guest-to-login cart handling.** On sign-in/registration, a non-empty
  guest cart is **merged** into the account cart: items are unioned and
  quantities summed for duplicate products (FR28). Not "replace", not "prompt".
- **D3 — Authentication (architecture).** Requirement: email/password
  registration and login, guest mode, and a persistent session (FR24–FR27). The
  implementation mechanism (auth library vs. hand-rolled session) is an
  Architecture decision; passwords must be stored hashed regardless (NFR-S1).
- **D4 — Product detail presentation.** A dedicated product detail view is
  required (FR2). Route vs. modal is a UX decision deferred to the UX spec; a
  dedicated route (`/products/[id]`) is the leading option for shareability.
- **A1 — Seed data.** The catalog is populated by a seed script with a small,
  fixed set of products; there is no product-authoring UI.
- **A2 — Single environment.** No multi-environment, multi-tenant, or
  concurrent-scale concerns — this is a local demo (see NFR scope notes).

## Functional Requirements

This FR list is the **capability contract**: UX, Architecture, and the epic
breakdown implement only what is listed here. Each FR states a capability (WHAT),
not an implementation (HOW).

### Product Catalog

- **FR1:** A visitor can view a list of all available products showing name,
  price, and image.
- **FR2:** A visitor can open a product to view its detail, including
  description, price, image, and availability.
- **FR3:** A visitor can navigate from the catalog to a product detail view and
  back without losing their place.

### Shopping Cart

- **FR4:** A visitor can add a product to their cart from the catalog or the
  product detail view.
- **FR5:** A visitor can view their cart contents, including each item's
  quantity and subtotal and the cart total.
- **FR6:** A visitor can change the quantity of an item in their cart.
- **FR7:** A visitor can remove an item from their cart.
- **FR8:** A visitor's cart contents persist across page reloads and in-app
  navigation within a session.
- **FR9:** A logged-in user's cart persists across separate sessions.
- **FR10:** A visitor can see a cart indicator showing the current item count
  from any page.
- **FR11:** The system prevents starting checkout with an empty cart.

### Checkout

- **FR12:** A visitor can begin checkout from their cart.
- **FR13:** A visitor can review an order summary (items, quantities, and
  totals) during checkout.
- **FR14:** A visitor can enter a shipping address during checkout.
- **FR15:** The system validates that all required checkout fields are completed
  and well-formed before the order can be placed.

### Shipping (Mocked)

- **FR16:** A visitor can choose from one or more mocked shipping methods during
  checkout.
- **FR17:** A visitor can see the cost and estimated delivery timeframe for the
  selected shipping method.
- **FR18:** The system includes the selected shipping cost in the order total.

### Payment & Order (Mocked)

- **FR19:** A visitor can enter payment details into a mocked payment form
  during checkout.
- **FR20:** The system simulates payment authorization without contacting any
  real payment processor or moving any real funds.
- **FR21:** A visitor can place an order, which the system records as a
  persisted order.
- **FR22:** A visitor sees an order confirmation showing an order reference, the
  ordered items, totals, and the selected shipping method after a successful
  order.
- **FR23:** The system can simulate a payment failure and lets the visitor
  correct details and retry without losing the order in progress.

### User Accounts & Sessions

- **FR24:** A visitor can browse, build a cart, and complete checkout entirely
  as a guest, without an account.
- **FR25:** A visitor can register an account using an email and password.
- **FR26:** A registered user can log in and log out.
- **FR27:** A logged-in user's authenticated session persists across page
  reloads until logout or session expiry.
- **FR28:** When a guest with a non-empty cart logs in or registers, the guest
  cart is merged into the account cart (items unioned, duplicate quantities
  summed).

## Non-Functional Requirements

Only categories relevant to this product are documented.

### Performance

- **NFR-P1:** Catalog and product detail views render within 1 second on the
  local development environment with seeded data.
- **NFR-P2:** Cart mutations (add/update/remove) reflect in the UI within
  200 ms, using optimistic UI updates.

### Security

- **NFR-S1:** User passwords are stored only as a salted, one-way hash; plaintext
  passwords are never persisted or logged.
- **NFR-S2:** Session credentials are stored in a secure, HTTP-only cookie and
  are not accessible to client-side scripts.
- **NFR-S3:** Mocked payment details (card number, etc.) are never persisted and
  never logged.
- **NFR-S4:** All mutating server operations validate and authorize their inputs
  at the API boundary; account-scoped data is accessible only to its owner.

### Reliability & Data Integrity

- **NFR-R1:** Cart and order state are persisted to the application's database
  and survive an application restart.
- **NFR-R2:** Order placement is atomic — an order and its line items are either
  fully recorded or not recorded at all.

### Accessibility

- **NFR-A1:** The UI is built on accessible component primitives, is fully
  keyboard navigable, and meets WCAG 2.1 AA basics (form labels, visible focus,
  sufficient contrast).

### Maintainability

- **NFR-M1:** The application is end-to-end type-safe (typed contracts from
  client through the API layer to the database) and follows the layering and
  clean-code standards in `CLAUDE.md`.

### Explicitly Not Required

- **Scalability** — single-user local demo; no concurrency, load, or growth
  targets. Documented here to prevent requirement bloat.
- **Integration** — no external systems; payment and shipping are mocked.

## Open Items for Downstream Phases

- **UX:** Product detail as route vs. modal (D4); checkout as single page vs.
  multi-step; empty/loading/error state designs for catalog, cart, and checkout.
- **Architecture:** Cart persistence mechanism (D1); authentication/session
  mechanism (D3); data model for Product, Cart, CartItem, User, Session, Order,
  OrderItem; mock-payment and mock-shipping module boundaries.

## Traceability Notes

- Setup/scaffolding (Scope · In Scope) is enabling work, not a product
  capability — it becomes the foundational epic ("Epic 0") in the epic breakdown
  rather than an FR.
- Every In-Scope item maps to FRs: catalog → FR1–FR3; cart → FR4–FR11; checkout
  → FR12–FR15; shipping → FR16–FR18; payment & order → FR19–FR23; accounts &
  sessions → FR24–FR28.
- Success criteria mapping: SC1 → FR1–FR22; SC2 → FR8; SC3 → FR24–FR27; SC4 →
  FR28; SC5 → A1 + Project Type constraints; SC6 → NFR-M1; SC7 → FR23.
