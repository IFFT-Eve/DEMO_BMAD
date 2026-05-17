---
title: "Product Brief: bmad_demo"
status: "complete"
created: "2026-05-14"
updated: "2026-05-14"
inputs: ["user brief (verbal, 2026-05-14)"]
---

# Product Brief: bmad_demo — Demo E-Commerce Storefront

## Executive Summary

`bmad_demo` is a deliberately small e-commerce storefront built end-to-end as a
reference implementation for the BMAD method on a modern full-stack TypeScript
architecture. A shopper can browse a product list, add items to a cart whose
selection survives page reloads, and complete a checkout with mocked shipping
and payment — either as an anonymous guest or as a logged-in user.

It is **not** a commercial store. Its value is as a learning and reference
vehicle: an application large enough to exercise real architectural concerns —
state management, client caching, authentication, multi-step flows, relational
persistence — but bounded tightly enough to be planned, built, and reviewed in
full. Toy to-do apps are too trivial to teach anything; production stores are
too sprawling to finish. An e-commerce MVP with mocked externals sits in the
sweet spot.

## The Problem

Anyone learning the BMAD workflow — or validating a modern Next.js/tRPC/Prisma
stack — needs a project that is realistic without being open-ended. The common
options fail in opposite directions: tutorial apps (a counter, a to-do list)
never surface caching, auth, or transactional flows; real product work has
unbounded scope and external dependencies (payment processors, shipping APIs,
inventory systems) that stall a learning exercise before the interesting parts.
The cost of the status quo is that the BMAD pipeline and the stack never get
exercised against a problem with genuine structural depth.

## The Solution

A focused e-commerce MVP covering exactly five capability areas — product
listing, cart, checkout, shipping, payment — plus the foundational app setup.
Shipping and payment are **mocked**: they simulate the user experience and data
flow of the real thing (address entry, payment form, order confirmation) but
perform no real transaction and call no external service. Authentication is
real but minimal, supporting two first-class modes: shop as a guest, or sign in
for a persistent identity. The result is a complete, demonstrable purchase
journey with zero external integrations.

## What Makes This Different

- **Bounded by design.** The scope is fixed and small; the discipline is in
  *not* growing it.
- **Mocked externals.** Payment and shipping are simulated, so the build never
  blocks on third-party accounts, keys, or sandboxes.
- **Opinionated modern stack.** Next.js, TailwindCSS, shadcn/ui, tRPC, Prisma,
  SQLite, and React Query — a coherent, type-safe, end-to-end TypeScript setup
  that is itself part of what the project demonstrates.

## Who This Serves

- **Primary — the builder/learner.** A developer using BMAD to plan and
  implement the app. Success = a clean, working reference they understand
  end-to-end and can extend.
- **Secondary — the shopper persona.** The user inside the app, in two variants:
  the **guest** (browses and checks out with no account) and the
  **registered user** (signs in; identity and cart persist across sessions).
  Success = reaching an order confirmation without friction in either mode.

## Success Criteria

- All five flows work end-to-end: list → cart → checkout → (mock) shipping →
  (mock) payment → order confirmation.
- Cart selection persists across a page reload and across navigation.
- Both guest and logged-in modes reach a completed (mock) order.
- A guest who signs in mid-session keeps the cart they built as a guest.
- The codebase follows `CLAUDE.md` standards (clean code, layering, type-safe
  contracts end to end via tRPC).
- The app runs locally from a single `setup` epic with no manual external
  configuration.

## Scope

**In scope (MVP):**
- App setup & scaffolding — Next.js, TailwindCSS, shadcn/ui, tRPC, Prisma,
  SQLite, React Query; seeded product data.
- Product listing (browse catalog, view product detail).
- Cart — add/remove/update quantity; cart selection cached so it survives
  reload and navigation.
- Checkout — review cart, enter shipping address.
- Shipping — mocked: method selection and cost, no carrier integration.
- Payment — mocked: payment form and confirmation, no real charge, no
  processor.
- Auth — guest mode and email/password login; cart carries over on sign-in.

**Out of scope (explicitly not in MVP):**
- Real payment processing or any payment provider integration.
- Real shipping/carrier APIs or live rates.
- Admin/seller dashboard, inventory management, order fulfillment.
- Product search, filtering, categories, recommendations, reviews/ratings.
- Discounts, coupons, taxes, multi-currency.
- Email/notifications, password reset, social login.
- Order history beyond the just-completed order confirmation.

## Technical Approach

End-to-end TypeScript. Next.js (App Router) for the frontend and server;
TailwindCSS + shadcn/ui for the UI layer; tRPC for type-safe client/server
contracts; React Query for client-side server-state and cart caching; Prisma
ORM over a local SQLite database for persistence. The stack is intentionally
local-first and zero-config so the app runs from `npm install` + a seed step.

## Vision

If it succeeds, `bmad_demo` becomes a reusable BMAD reference template — a
known-good starting point others fork to learn the method or bootstrap a real
storefront by swapping the mocked shipping/payment layers for real providers
and lifting the out-of-scope items in as their own epics.
