---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md', 'product-brief-bmad_demo.md']
workflowType: 'epics-and-stories'
status: 'complete'
date: '2026-05-14'
---

# bmad_demo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad_demo,
decomposing the requirements from the PRD, the UX Design Specification, and the
Architecture Decision Document into implementable stories.

Epic sequencing follows the architecture's implementation sequence: a
foundational epic first (scaffold → Prisma → tRPC → shadcn/ui), then feature
epics in FR order — catalog → cart → **accounts before checkout** (so the
guest/registered split and guest-cart merge exist before the order flow).

## Requirements Inventory

### Functional Requirements

**Product Catalog**
- FR1: A visitor can view a list of all available products showing name, price, and image.
- FR2: A visitor can open a product to view its detail, including description, price, image, and availability.
- FR3: A visitor can navigate from the catalog to a product detail view and back without losing their place.

**Shopping Cart**
- FR4: A visitor can add a product to their cart from the catalog or the product detail view.
- FR5: A visitor can view their cart contents, including each item's quantity and subtotal and the cart total.
- FR6: A visitor can change the quantity of an item in their cart.
- FR7: A visitor can remove an item from their cart.
- FR8: A visitor's cart contents persist across page reloads and in-app navigation within a session.
- FR9: A logged-in user's cart persists across separate sessions.
- FR10: A visitor can see a cart indicator showing the current item count from any page.
- FR11: The system prevents starting checkout with an empty cart.

**Checkout**
- FR12: A visitor can begin checkout from their cart.
- FR13: A visitor can review an order summary (items, quantities, and totals) during checkout.
- FR14: A visitor can enter a shipping address during checkout.
- FR15: The system validates that all required checkout fields are completed and well-formed before the order can be placed.

**Shipping (Mocked)**
- FR16: A visitor can choose from one or more mocked shipping methods during checkout.
- FR17: A visitor can see the cost and estimated delivery timeframe for the selected shipping method.
- FR18: The system includes the selected shipping cost in the order total.

**Payment & Order (Mocked)**
- FR19: A visitor can enter payment details into a mocked payment form during checkout.
- FR20: The system simulates payment authorization without contacting any real payment processor or moving any real funds.
- FR21: A visitor can place an order, which the system records as a persisted order.
- FR22: A visitor sees an order confirmation showing an order reference, the ordered items, totals, and the selected shipping method after a successful order.
- FR23: The system can simulate a payment failure and lets the visitor correct details and retry without losing the order in progress.

**User Accounts & Sessions**
- FR24: A visitor can browse, build a cart, and complete checkout entirely as a guest, without an account.
- FR25: A visitor can register an account using an email and password.
- FR26: A registered user can log in and log out.
- FR27: A logged-in user's authenticated session persists across page reloads until logout or session expiry.
- FR28: When a guest with a non-empty cart logs in or registers, the guest cart is merged into the account cart (items unioned, duplicate quantities summed).

### NonFunctional Requirements

- NFR-P1: Catalog and product detail views render within 1 second on the local development environment with seeded data.
- NFR-P2: Cart mutations (add/update/remove) reflect in the UI within 200 ms, using optimistic UI updates.
- NFR-S1: User passwords are stored only as a salted, one-way hash; plaintext passwords are never persisted or logged.
- NFR-S2: Session credentials are stored in a secure, HTTP-only cookie and are not accessible to client-side scripts.
- NFR-S3: Mocked payment details (card number, etc.) are never persisted and never logged.
- NFR-S4: All mutating server operations validate and authorize their inputs at the API boundary; account-scoped data is accessible only to its owner.
- NFR-R1: Cart and order state are persisted to the application's database and survive an application restart.
- NFR-R2: Order placement is atomic — an order and its line items are either fully recorded or not recorded at all.
- NFR-A1: The UI is built on accessible component primitives, is fully keyboard navigable, and meets WCAG 2.1 AA basics (form labels, visible focus, sufficient contrast).
- NFR-M1: The application is end-to-end type-safe (typed contracts from client through the API layer to the database) and follows the layering and clean-code standards in CLAUDE.md.

### Additional Requirements

From the Architecture Decision Document — technical requirements that shape the foundational epic and constrain all stories:

- **Starter template (ADR-001).** The project is initialized with `create-next-app` using a fixed flag set. This is Epic 1, Story 1.1.
- **Pinned stack.** Next.js 16.2 (App Router, Turbopack), React 19.2, TailwindCSS v4, shadcn/ui (CLI v4), tRPC v11.13 with `@trpc/react-query`, TanStack Query v5, Prisma v7 with the `better-sqlite3` driver adapter over SQLite, Zod v4, React Hook Form, TypeScript strict.
- **Layering (ADR-002).** Four layers, dependencies inward only: Presentation → tRPC routers → services → Prisma. UI never imports Prisma; routers hold no business logic; only services touch the DB.
- **Data model (ADR-005).** Prisma schema for User, Session, Product, Cart, CartItem, Order, OrderItem. Tables are created in the foundational epic's schema story (the model is small and fully designed); each feature story then *uses* its tables.
- **Cart identity (ADR-003).** Server-side cart owned by either a `userId` or a `guest_cart_token` HTTP-only cookie; one cart source for drawer and checkout.
- **Auth mechanism (ADR-004).** Hand-rolled session: `crypto.scrypt` password hashing, a `Session` table, an HTTP-only `session_token` cookie. No external auth library.
- **Mock modules (ADR-007).** `mockShipping` and `mockPayment` are isolated domain modules; `mockPayment` declines the sentinel card `4000000000000002` deterministically and never persists or logs card data.
- **Money (ADR-008).** All monetary values are integer cents end to end; formatted to a string only at the UI edge.
- **Validation contract (ADR-009).** Zod schemas defined once, reused by tRPC inputs and React Hook Form.
- **Atomic order (ADR-010).** `placeOrder` runs inside a single Prisma `$transaction`.
- **Setup contract (SC5).** The app comes up from one foundational epic: `install` → `seed` → `run`, with no external accounts, keys, or services.

### UX Design Requirements

The UX Design Specification is mostly design *direction* consumed inside feature
stories rather than standalone work items, so these UX-DRs are woven into the
acceptance criteria of the epics noted — there is no separate "design system"
epic.

- **UX-DR1: Visual token layer.** A single neutral palette + one accent color as CSS variables consumed by Tailwind v4 and shadcn theme tokens; one sans-serif type scale; light theme only. shadcn/ui primitives used as-is, lightly themed. → Epic 1, Story 1.4.
- **UX-DR2: State-complete views.** Every data-bound view implements loading, empty, error, and success states per the UX Screen State Inventory — never happy-path only. → woven into Epics 2, 3, 5.
- **UX-DR3: Accessibility (NFR-A1, WCAG 2.1 AA basics).** All inputs have associated labels; visible focus rings on all interactive elements; the cart drawer and dialogs trap focus and restore it on close; full keyboard operability catalog → detail → cart → checkout; color is never the only signal. → cross-cutting AC on every UI-bearing story.
- **UX-DR4: Responsive, mobile-first.** Catalog grid reflows 1→2→3→4 columns; cart `Sheet` is full-width on mobile and a side panel on desktop; checkout Order Summary is a sticky sidebar on desktop and a collapsible top summary on mobile. → woven into Epics 2, 3, 5.
- **UX-DR5: Honest mock labelling.** Shipping methods, the payment form, and the order confirmation each carry a persistent, visible "simulated — no real charge" marker. → Epic 5, Stories 5.3, 5.4, 5.5.
- **UX-DR6: Information architecture & routes.** Routes exactly as the UX IA table — `/`, `/products/[id]`, `/checkout`, `/order/[ref]`, `/login`, `/register` — plus a global header (logo, cart icon + count badge opening the cart drawer, account area). Cart is a slide-over drawer, not a route; checkout is a single sectioned route, not a multi-route wizard. → Epic 1 (header shell) + respective feature epics.

### FR Coverage Map

- FR1: Epic 2 — Browse the product list (Story 2.1)
- FR2: Epic 2 — View product detail (Story 2.2)
- FR3: Epic 2 — Navigate catalog ↔ detail without losing place (Story 2.2)
- FR4: Epic 3 — Add a product to the cart (Story 3.1)
- FR5: Epic 3 — View the cart drawer (Story 3.2)
- FR6: Epic 3 — Update item quantity (Story 3.3)
- FR7: Epic 3 — Remove an item (Story 3.4)
- FR8: Epic 3 — Cart persists across reload and navigation (Story 3.2)
- FR9: Epic 4 — Logged-in user's cart persists across sessions (Story 4.4)
- FR10: Epic 3 — Cart indicator / item-count badge (Story 3.1)
- FR11: Epic 3 — Prevent checkout with an empty cart (Story 3.5)
- FR12: Epic 5 — Begin checkout from the cart (Story 5.1)
- FR13: Epic 5 — Review the order summary during checkout (Story 5.1)
- FR14: Epic 5 — Enter a shipping address (Story 5.2)
- FR15: Epic 5 — Validate required checkout fields (Story 5.2)
- FR16: Epic 5 — Choose a mocked shipping method (Story 5.3)
- FR17: Epic 5 — See shipping cost and delivery estimate (Story 5.3)
- FR18: Epic 5 — Include shipping cost in the order total (Story 5.3)
- FR19: Epic 5 — Enter mock payment details (Story 5.4)
- FR20: Epic 5 — Simulate payment authorization (Story 5.4)
- FR21: Epic 5 — Place an order, persisted atomically (Story 5.5)
- FR22: Epic 5 — Order confirmation page (Story 5.5)
- FR23: Epic 5 — Recover from a simulated payment failure (Story 5.6)
- FR24: Epic 5 — Complete the full journey as a guest (Story 5.7)
- FR25: Epic 4 — Register an account (Story 4.1)
- FR26: Epic 4 — Log in and log out (Story 4.2)
- FR27: Epic 4 — Persistent authenticated session (Story 4.3)
- FR28: Epic 4 — Merge a guest cart into the account on sign-in (Story 4.5)

Epic 1 (Project Foundation & Scaffolding) is enabling work and maps to no FR
directly — per the PRD Traceability Notes, setup is the foundational epic, not a
product capability. It enables every FR above.

## Epic List

### Epic 1: Project Foundation & Scaffolding
A developer can install, seed, and run the application locally — the scaffolded Next.js app, the Prisma data model over SQLite, the tRPC API contract, and the shadcn/ui foundation are all in place, and `install → seed → run` works with no external services.
**FRs covered:** none directly — enabling work for all FRs (SC5, SC6, A1; ADR-001/002/005/006).

### Epic 2: Product Catalog
A visitor can browse all seeded products and open any product to see its full detail, moving between the catalog and a product without losing their place.
**FRs covered:** FR1, FR2, FR3.

### Epic 3: Shopping Cart
A visitor can build a server-side cart — add products, view them in a slide-over drawer with totals, adjust quantities, remove items — see a live item-count badge from any page, and have that cart survive reloads and navigation. Checkout cannot start from an empty cart.
**FRs covered:** FR4, FR5, FR6, FR7, FR8, FR10, FR11.

### Epic 4: User Accounts & Sessions
A visitor can register an account, log in and out, and stay signed in across reloads. A logged-in user's cart persists across separate sessions, and a guest who signs in with a non-empty cart has it merged into their account cart.
**FRs covered:** FR25, FR26, FR27, FR9, FR28.

### Epic 5: Checkout, Shipping, Payment & Order
A visitor can complete the full purchase journey — begin checkout, review the summary, enter and validate a shipping address, pick a mocked shipping method, enter mock payment details, place an atomically-recorded order, and see a confirmation — recover gracefully from a simulated payment failure, and do all of this entirely as a guest.
**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24.

---

## Epic 1: Project Foundation & Scaffolding

A developer can install, seed, and run the application locally. By the end of this epic the scaffolded Next.js app, the Prisma data model over SQLite, the tRPC API contract, and the shadcn/ui UI foundation are all in place — `install → seed → run` works with no external accounts, keys, or services (SC5), and the layered, end-to-end-typed structure from the architecture is established (SC6, NFR-M1). This epic creates no user-facing capability on its own; it enables every following epic.

### Story 1.1: Scaffold the Next.js application

As a developer,
I want the project initialized from the official starter with the architecture's pinned configuration,
So that every following story builds on a consistent, known-good base.

**Acceptance Criteria:**

**Given** an empty project directory
**When** the project is scaffolded per ADR-001
**Then** `create-next-app` is run with TypeScript, TailwindCSS, ESLint, App Router, `src/` directory, Turbopack, and the `@/*` import alias
**And** `npm run dev` starts the app and it renders a page without errors
**And** TypeScript is in `strict` mode and `npm run lint` passes on the scaffold

**Given** the scaffolded project
**When** its dependencies and tooling are inspected
**Then** the versions match the pinned stack in the architecture (Next.js 16.2.x, React 19.2) and no extra unrequested dependencies were added

### Story 1.2: Establish the database layer with Prisma

As a developer,
I want the full Prisma data model and a local SQLite database in place,
So that feature stories can persist and read their data through a typed, owned data layer.

**Acceptance Criteria:**

**Given** the scaffolded project
**When** the database layer is added per ADR-005
**Then** Prisma v7 and the `better-sqlite3` driver adapter are installed and `prisma/schema.prisma` defines User, Session, Product, Cart, CartItem, Order, and OrderItem exactly as specified in the architecture (money fields as integer cents, `Cart` with nullable mutually-exclusive `userId`/`guestToken`, `OrderItem` snapshot fields)
**And** an initial migration is generated and applied, creating `prisma/dev.db`
**And** a single Prisma client singleton is exported from `src/server/db.ts`

**Given** the data layer
**When** the application is restarted
**Then** previously written rows are still present (NFR-R1)

**Given** `prisma/seed.ts`
**When** the seed script is run
**Then** a small fixed set of products is inserted with name, slug, description, image URL, price in cents, and stock (A1) — and there is no product-authoring UI

### Story 1.3: Wire the tRPC API contract

As a developer,
I want the tRPC server, context, and React-Query-bound client wired end to end,
So that all client–server communication flows through one typed, validated boundary (ADR-002, ADR-006, NFR-M1).

**Acceptance Criteria:**

**Given** the project with the data layer in place
**When** the tRPC layer is added
**Then** `src/server/trpc.ts` exposes the tRPC init, `publicProcedure`, and `protectedProcedure`, `src/server/context.ts` resolves the session user and the active cart (guest-token or user) into context, `src/server/root.ts` merges the routers, and `src/app/api/trpc/[trpc]/route.ts` serves them
**And** the client side (`src/lib/trpc/`) provides a `@trpc/react-query` client and a Provider wired into the root layout with TanStack Query v5
**And** a trivial `health`/`me`-style query can be called from a component and returns typed data with no `any` on the path

**Given** the layering rule (ADR-002)
**When** the structure is reviewed
**Then** routers contain no business logic and only files under `src/server/services/` import `src/server/db.ts`

### Story 1.4: Establish the UI foundation with shadcn/ui

As a developer,
I want shadcn/ui, the Tailwind v4 token layer, and the global app shell in place,
So that feature stories assemble screens from consistent, accessible primitives (UX-DR1, UX-DR6, NFR-A1).

**Acceptance Criteria:**

**Given** the scaffolded project
**When** the UI foundation is added
**Then** shadcn/ui (CLI v4) is initialized for Next.js 16 / Tailwind v4, and a single token layer (neutral palette + one accent, light theme only) is defined as CSS variables consumed by Tailwind and the shadcn theme
**And** a global app shell renders in the root layout: a header with a home/logo link, a cart icon slot, and an account-area slot (placeholders are acceptable until Epics 3 and 4 fill them)
**And** the type scale (display / heading / body / caption) is configured with a system-font fallback

**Given** the app shell
**When** it is navigated by keyboard
**Then** all interactive elements show a visible focus ring and the layout meets WCAG 2.1 AA contrast basics (UX-DR3)

---

## Epic 2: Product Catalog

A visitor can browse all seeded products and open any product to see its full detail. This epic delivers the read-only top of the funnel: the catalog grid and the product detail route, both fast (NFR-P1) and state-complete (UX-DR2). It depends only on Epic 1.

### Story 2.1: Browse the product list

As a visitor,
I want to see a list of all available products with their name, price, and image,
So that I can find something to buy.

**Acceptance Criteria:**

**Given** the seeded catalog
**When** I open `/`
**Then** I see a grid of every available product, each showing its name, price (formatted from integer cents), and image
**And** the grid reflows responsively from 1 column on mobile to up to 4 on desktop (UX-DR4)
**And** the view renders within 1 second on the local environment with seeded data (NFR-P1)

**Given** the catalog is loading
**When** the product data has not yet arrived
**Then** skeleton product cards are shown; if there are no products, a "No products" message is shown; if the load fails, an error state with a retry affordance is shown (UX-DR2)

**Given** the catalog is served through the layered architecture
**When** the data path is reviewed
**Then** the list comes from `productService.list` via `productRouter.list` (a public query) — the component does not touch Prisma

### Story 2.2: View product detail and navigate back

As a visitor,
I want to open a product to see its full detail and return to the catalog where I left off,
So that I can evaluate a product without losing my browsing context.

**Acceptance Criteria:**

**Given** the catalog
**When** I click a product
**Then** I navigate to `/products/[id]` and see its description, price, image, and availability (FR2)
**And** the detail comes from `productService.byId` via `productRouter.byId`

**Given** I am on a product detail page
**When** I navigate back to the catalog
**Then** the catalog is restored with my previous scroll position / place preserved (FR3)

**Given** a product id that does not exist
**When** I open `/products/[id]` for it
**Then** a 404 / "Couldn't load product" state is shown with a link back to the catalog (UX-DR2)

**Given** the detail page is loading
**When** the product data has not yet arrived
**Then** a skeleton detail layout is shown (UX-DR2)

---

## Epic 3: Shopping Cart

A visitor can build a server-side cart and manage it through a slide-over drawer. This epic introduces the `Cart`/`CartItem` data path and the guest-cart cookie identity (ADR-003), delivers add / view / update / remove with optimistic UI (NFR-P2), a global item-count badge, cart durability across reload and navigation (FR8), and the empty-cart checkout guard (FR11). It depends on Epics 1–2. The logged-in cart path and the guest-cart merge are intentionally deferred to Epic 4, where accounts exist.

### Story 3.1: Add a product to the cart

As a visitor,
I want to add a product to my cart from the catalog or a product detail page and see the cart count update,
So that I can collect items to buy.

**Acceptance Criteria:**

**Given** I am a guest with no cart yet
**When** I add a product to my cart
**Then** a server-side `Cart` is created and associated with a new opaque `guest_cart_token` set as an HTTP-only, SameSite=Lax cookie (ADR-003), and a `CartItem` is created for the product
**And** adding a product already in the cart increments its quantity rather than creating a duplicate row

**Given** any page with the global header
**When** I add a product to the cart
**Then** the header cart-count badge reflects the new total item count (FR10) and updates optimistically within 200 ms, with a confirmation toast (NFR-P2)
**And** if the server call fails, the optimistic update is rolled back and an error toast is shown

**Given** the add-to-cart path
**When** its inputs are reviewed
**Then** `cartRouter.addItem` validates its input with a shared Zod schema and delegates to `cartService.addItem` (NFR-S4, ADR-009)

### Story 3.2: View the cart in a slide-over drawer

As a visitor,
I want to open a cart drawer showing my line items and totals,
So that I can review what I'm about to buy from anywhere in the app.

**Acceptance Criteria:**

**Given** I have items in my cart
**When** I click the header cart icon
**Then** a slide-over drawer (`Sheet`) opens showing each line item with its quantity and subtotal and the overall cart total, plus a "Checkout" action (FR5)
**And** the drawer is full-width on mobile and a side panel on desktop (UX-DR4)

**Given** my cart has items
**When** I reload the page or navigate between in-app routes
**Then** my cart contents are unchanged — the cart is read from the server via `cartService.get` / `cartRouter.get`, keyed by my `guest_cart_token` (FR8)

**Given** my cart is empty
**When** I open the drawer
**Then** an "Your cart is empty" state with a "Browse products" call to action is shown (UX-DR2)

**Given** the drawer is open
**When** I operate it by keyboard
**Then** focus is trapped inside the drawer and restored to the trigger on close (UX-DR3)

### Story 3.3: Update item quantity in the cart

As a visitor,
I want to change the quantity of an item in my cart,
So that I can buy the amount I actually want.

**Acceptance Criteria:**

**Given** an item in my cart
**When** I use the quantity stepper to increase or decrease its quantity
**Then** the line subtotal and cart total update optimistically within 200 ms (NFR-P2, FR6)
**And** setting the quantity to 0 removes the item from the cart

**Given** a quantity update
**When** the server call fails
**Then** the optimistic change is rolled back and an error toast is shown

**Given** the update path
**When** its inputs are reviewed
**Then** `cartRouter.updateItem` validates with a shared Zod schema and delegates to `cartService.updateItem`, which operates only on the caller's active cart (NFR-S4)

### Story 3.4: Remove an item from the cart

As a visitor,
I want an explicit control to remove an item from my cart,
So that I can take something out without fiddling with the quantity.

**Acceptance Criteria:**

**Given** an item in my cart
**When** I activate its remove control
**Then** the item is removed and the drawer, totals, and header badge update optimistically within 200 ms (NFR-P2, FR7)

**Given** a remove action
**When** the server call fails
**Then** the optimistic removal is rolled back and an error toast is shown

**Given** the remove path
**When** its inputs are reviewed
**Then** `cartRouter.removeItem` validates with a shared Zod schema and delegates to `cartService.removeItem` on the caller's active cart (NFR-S4)

### Story 3.5: Prevent checkout from an empty cart

As a visitor,
I want the app to stop me from starting checkout with an empty cart,
So that I never reach a meaningless checkout flow.

**Acceptance Criteria:**

**Given** my cart is empty
**When** I view the cart drawer
**Then** the "Checkout" action is disabled (FR11)

**Given** my cart is empty
**When** I attempt to open `/checkout` directly
**Then** I am redirected back to the catalog rather than shown an empty checkout

**Given** my cart has at least one item
**When** I view the cart drawer
**Then** the "Checkout" action is enabled

---

## Epic 4: User Accounts & Sessions

A visitor can register, log in and out, and stay signed in across reloads (ADR-004). Building on the cart infrastructure from Epic 3, this epic adds the logged-in cart path (FR9) and the guest-cart merge on sign-in (FR28). It depends on Epics 1–3. It is sequenced before checkout so the guest/registered split and the merge are settled before the order flow.

### Story 4.1: Register an account

As a visitor,
I want to create an account with an email and password,
So that I can have a persistent identity and a cart that follows me.

**Acceptance Criteria:**

**Given** I am on `/register`
**When** I submit a valid, unique email and a password
**Then** a `User` is created with the password stored only as a salted, one-way `crypto.scrypt` hash — plaintext is never persisted or logged (NFR-S1)
**And** a session is created and I am signed in immediately on success

**Given** I submit an email that is already registered
**When** the form is processed
**Then** an inline "email already used" error is shown and no user is created (the router returns a typed `CONFLICT`)

**Given** the registration form
**When** I submit invalid input (malformed email, empty password)
**Then** inline field-level validation errors are shown, driven by the same Zod schema the `authRouter.register` procedure validates against (FR15-style boundary validation, ADR-009, NFR-S4)

### Story 4.2: Log in and log out

As a registered user,
I want to log in and log out,
So that I can access my account and end my session when done.

**Acceptance Criteria:**

**Given** I am on `/login` with a registered account
**When** I submit my correct email and password
**Then** a `Session` row is created and its opaque id is stored in a Secure, HTTP-only, SameSite=Lax `session_token` cookie not readable by client scripts (NFR-S2), and I land back on the route I came from
**And** the header account area switches from a "Log in" link to an account menu (`DropdownMenu` + `Avatar`) with a "Log out" action

**Given** incorrect credentials
**When** I submit the login form
**Then** an inline "invalid credentials" error is shown and no session is created

**Given** I am logged in
**When** I choose "Log out"
**Then** my `Session` row is deleted, the `session_token` cookie is cleared, and the header reverts to the guest "Log in" link

### Story 4.3: Persist the authenticated session across reloads

As a logged-in user,
I want to stay signed in when I reload or revisit the app,
So that I don't have to log in repeatedly during normal use.

**Acceptance Criteria:**

**Given** I am logged in
**When** I reload the page or navigate between routes
**Then** I remain signed in — the tRPC context resolves my user from the `session_token` cookie and a non-expired `Session` row — and the header continues to show my account menu (FR27)

**Given** my session has passed its `expiresAt`
**When** I make a request
**Then** I am treated as a guest, and protected actions require logging in again

**Given** a `me`-style query
**When** called as a guest (no valid session)
**Then** it resolves to `null` rather than erroring, so guest flows are unaffected

### Story 4.4: Persist a logged-in user's cart across sessions

As a logged-in user,
I want my cart to still be there the next time I sign in,
So that I don't lose items between visits.

**Acceptance Criteria:**

**Given** I am logged in with items in my cart
**When** I log out and later log back in (a separate session)
**Then** my cart still contains exactly those items (FR9) — the active cart is resolved by `userId` when I am authenticated

**Given** I am logged in
**When** I add, update, or remove cart items
**Then** the changes are written to my user-owned `Cart` and survive an application restart (NFR-R1)

**Given** cart access while authenticated
**When** the cart is read or mutated
**Then** the service authorizes that the cart belongs to me — I can never read or modify another user's cart (NFR-S4)

### Story 4.5: Merge a guest cart into the account on sign-in

As a visitor who built a cart as a guest,
I want that cart to carry over when I log in or register,
So that signing in never costs me my in-progress shopping.

**Acceptance Criteria:**

**Given** I am a guest with a non-empty cart
**When** I log in or register
**Then** my guest cart is merged into my account cart inside a single Prisma `$transaction`: items are unioned and, for products in both carts, quantities are summed (FR28)
**And** the guest `Cart` is deleted and the `guest_cart_token` cookie is cleared

**Given** I am a guest with an empty or no cart
**When** I log in or register
**Then** my existing account cart is left unchanged and no empty guest cart lingers

**Given** the merge has completed
**When** the header badge and cart drawer refresh
**Then** they reflect the merged account cart's item count and contents

---

## Epic 5: Checkout, Shipping, Payment & Order

A visitor can complete the full purchase journey on the single sectioned `/checkout` route: review the summary, enter and validate a shipping address, choose a mocked shipping method, enter mock payment details, place an atomically-recorded order, and see a confirmation at `/order/[ref]` — recovering gracefully from a simulated payment failure, and doing all of it as a guest if they choose. This is one epic because every story modifies the same core files (the checkout route, `checkoutService`, the mock modules) — splitting would churn the same files with no feedback boundary between parts. It depends on Epics 1–4.

### Story 5.1: Begin checkout and review the order summary

As a visitor,
I want to start checkout from my cart and see an order summary throughout,
So that I always know what I'm buying as I go.

**Acceptance Criteria:**

**Given** my cart has at least one item
**When** I choose "Checkout" from the cart drawer
**Then** I navigate to `/checkout`, which shows the sectioned vertical flow (Shipping Address → Shipping Method → Payment → Review & Place Order) with a persistent Order Summary panel (FR12)

**Given** I am on `/checkout`
**When** I view the Order Summary
**Then** it shows each item, its quantity, line subtotals, and the running total, sourced from the same active cart the drawer uses (FR13)
**And** the summary is a sticky sidebar on desktop and a collapsible top summary on mobile (UX-DR4)

**Given** my cart is empty (e.g. it was emptied in another tab)
**When** `/checkout` loads
**Then** I am redirected to the catalog rather than shown an empty checkout (consistent with FR11)

### Story 5.2: Enter and validate a shipping address

As a visitor,
I want to enter my shipping address with clear validation,
So that my order ships to the right place and I can't submit a broken form.

**Acceptance Criteria:**

**Given** I am on `/checkout`
**When** I fill the Shipping Address section
**Then** I can enter name, address line 1, optional line 2, city, postal code, and country (FR14)

**Given** the shipping address form
**When** a required field is empty or malformed
**Then** an inline, field-level validation error is shown on blur and on submit, driven by a shared Zod schema; the same schema validates the input at the `checkoutRouter` boundary (FR15, ADR-009, NFR-S4)

**Given** required checkout fields are incomplete or invalid
**When** I look at the "Place Order" action
**Then** it remains disabled until all required checkout fields across the flow are valid (FR15)

### Story 5.3: Choose a mocked shipping method

As a visitor,
I want to pick a shipping method and see its cost and delivery estimate,
So that I can decide how my order ships and see the effect on my total.

**Acceptance Criteria:**

**Given** I am on the Shipping Method section
**When** the section loads
**Then** it shows one or more mocked shipping methods from `mockShipping.listMethods` via `checkoutRouter.getShippingMethods`, each as a `RadioGroup` option with a label, cost, and estimated delivery timeframe (FR16, FR17)

**Given** I select a shipping method
**When** the selection is applied
**Then** the chosen method's cost is added to the Order Summary total (FR18)

**Given** the Shipping Method section
**When** it is displayed
**Then** it carries a persistent, visible "simulated shipping" marker (UX-DR5)

### Story 5.4: Enter mock payment details

As a visitor,
I want to enter payment details into a clearly-simulated payment form,
So that I can authorize my (mock) purchase without any real charge.

**Acceptance Criteria:**

**Given** I am on the Payment section
**When** the section loads
**Then** it shows a mock payment form (card number and supporting fields) with a persistent, visible "Simulated payment — no real charge" `Alert` (FR19, UX-DR5)

**Given** I submit valid mock payment details
**When** the order is placed
**Then** `mockPayment.authorize` simulates authorization with no contact to any real payment processor and no movement of real funds (FR20)

**Given** mock payment details are entered
**When** the request is processed and afterward
**Then** the card number and other payment details are never written to the database and never logged (NFR-S3)

### Story 5.5: Place an order and see the confirmation

As a visitor,
I want to place my order and see a confirmation,
So that I know my purchase was recorded and can reference it.

**Acceptance Criteria:**

**Given** all required checkout fields are valid and mock payment is approved
**When** I activate "Place Order"
**Then** `checkoutService.placeOrder` runs inside a single Prisma `$transaction` that creates the `Order` (with a unique `ref`, the shipping address, selected method, shipping cost, subtotal, and total) and all `OrderItem` rows (with snapshotted product name and unit price) and clears the cart — all or nothing (FR21, NFR-R2, ADR-010)

**Given** the order was placed successfully
**When** the transaction commits
**Then** I am routed to `/order/[ref]` showing the order reference, the ordered items, the totals, and the selected shipping method (FR22)
**And** the confirmation page carries the persistent "simulated" marker (UX-DR5)

**Given** an order reference that does not exist or that I don't own
**When** I open `/order/[ref]`
**Then** an "Order not found" state is shown — `orderService` scopes order lookup to the requesting user or guest token (NFR-S4)

### Story 5.6: Recover from a simulated payment failure

As a visitor,
I want a clear, recoverable error when mock payment is declined,
So that a payment problem doesn't cost me my in-progress order.

**Acceptance Criteria:**

**Given** I am at the Payment section
**When** I place the order using the sentinel card number `4000000000000002`
**Then** `mockPayment.authorize` deterministically returns a typed `declined` result (ADR-007)

**Given** mock payment is declined
**When** the result comes back
**Then** an inline error block is shown on the Payment section, no `Order` is created, and the cart and all entered checkout details (address, shipping method, payment fields) are preserved (FR23)

**Given** a previously declined checkout
**When** I correct the payment details to a non-sentinel card and place the order again
**Then** authorization succeeds and the order completes normally through Story 5.5's flow

### Story 5.7: Complete the full journey as a guest

As a visitor without an account,
I want to complete the entire purchase journey as a guest,
So that buying never requires me to register.

**Acceptance Criteria:**

**Given** I have never logged in or registered
**When** I browse the catalog, build a cart, and go through checkout
**Then** I can complete every step — address, shipping, payment, place order — and reach an order confirmation, with no point in the flow requiring an account (FR24)

**Given** I placed an order as a guest
**When** I open my `/order/[ref]` confirmation within the same browser session
**Then** the order is shown — the guest order is scoped to my `guest_cart_token` so `orderService` authorizes me as its owner

**Given** the account UI is present in the header throughout the guest journey
**When** I proceed through checkout
**Then** "Log in" is only ever an option, never a gate or interruption (guest-first principle)
