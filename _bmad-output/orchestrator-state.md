# Orchestrator State

project: bmad_demo
started: 2026-05-14
current_phase: 4
current_stage: 8 — Per-epic Dev/QA loop · Epic 3 (Shopping Cart)
status: paused_at_user_request

## ▶️ RESUME HERE (Epic 3 — Shopping Cart)

- **Where we are:** Epics 1 and 2 are fully DONE (6 stories, all QA PASS).
  Epic 3 is ready to begin. Story file `3-1-add-a-product-to-the-cart.md` has
  been created (`ready-for-dev`). No Epic 3 implementation code has been written
  yet.
- **shadcn `sheet` and `sonner` components are already installed on disk**
  (`src/components/ui/sheet.tsx`, `src/components/ui/sonner.tsx`).
- **Next action (on resume):** Run the **full Epic 3 Dev pass** — implement all
  5 stories (3.1–3.5) plus unit tests in one Dev persona pass, then hand off to
  QA persona for independent E2E test creation + manual localhost verification.
  Loop Dev↔QA at the epic level until both auto and manual pass.

## Dev/QA Loop Rule (updated 2026-05-15)

**Granularity: epic-level, not story-by-story.**

1. **Dev persona** — implements all stories of the epic + writes unit tests (UT).
   Does not pre-validate or anticipate QA concerns.
2. **QA persona** — independently reads the epic ACs, creates automated E2E test
   cases from scratch, runs them, AND manually verifies the feature on localhost.
   The loop stops ONLY when both automated and manual checks pass.
3. **If QA finds failures** — send back to Dev. Dev fixes, QA retests. Repeat.
4. **If QA test cases are wrong per requirements** — QA fixes the tests, retests.
   Counts as a QA iteration, not a Dev failure.
5. **Cycle count** is tracked and reported at the epic gate.

## Stage Log

| Stage | Skill | Deliverable Path | Validated | Gate Approved | Date |
|-------|-------|------------------|-----------|---------------|------|
| 1 Product Brief | bmad-product-brief | planning-artifacts/product-brief-bmad_demo.md | ✅ 93% | ✅ | 2026-05-14 |
| 2 PRD | bmad-create-prd | planning-artifacts/prd.md | ✅ 95% | ✅ | 2026-05-14 |
| 3 Validate PRD | bmad-validate-prd | planning-artifacts/prd-validation-report.md | ✅ Pass | ✅ | 2026-05-14 |
| 3a UX Design | bmad-create-ux-design | planning-artifacts/ux-design-specification.md | ✅ 93% | ✅ | 2026-05-14 |
| 4 Architecture | bmad-create-architecture | planning-artifacts/architecture.md | ✅ 93% | ✅ | 2026-05-14 |
| 5 Epics & Stories | bmad-create-epics-and-stories | planning-artifacts/epics.md | ✅ 92% | ✅ | 2026-05-14 |
| 6 Readiness Check | bmad-check-implementation-readiness | planning-artifacts/implementation-readiness-report-2026-05-14.md | ✅ 95% READY | ✅ | 2026-05-14 |
| 7 Sprint Planning | bmad-sprint-planning | implementation-artifacts/sprint-status.yaml | ✅ Valid 5E/23S | ✅ | 2026-05-14 |

## Epic Loop (Phase 4)

| Epic | Stories | Dev Pass | QA Pass | Dev↔QA Cycles | Gate |
|------|---------|----------|---------|----------------|------|
| Epic 1 — Foundation | 4 | ✅ done | ✅ PASS | 0 | ✅ user approved 2026-05-15 |
| Epic 2 — Catalog | 2 | ✅ done | ✅ PASS | 0 | ✅ user approved 2026-05-15 |
| Epic 3 — Shopping Cart | 5 | ⏳ pending | — | — | pending |
| Epic 4 — User Accounts | 5 | backlog | — | — | — |
| Epic 5 — Checkout | 7 | backlog | — | — | — |

## Project State on Pause (2026-05-15)

- **Stack:** Next.js 16.2.6, TypeScript strict, Tailwind v4, shadcn/ui CLI v4,
  Prisma v7 + better-sqlite3 (SQLite), tRPC v11, TanStack Query v5, superjson.
- **Database:** 7-model schema migrated + seeded (6 products).
- **Installed shadcn components:** Button, Badge, Sheet, Sonner.
- **App shell:** AppHeader with cart icon slot (static button, not wired to cart
  yet), "Log in" link, home logo. Full globals.css token layer (indigo accent).
- **Vitest** unit tests (8/8 pass), **Playwright** E2E tests (9/9 pass) for
  Epics 1–2.
- `npm run lint` exit 0, `npm run build` succeeds.
- **Epic 3 story files created:**
  - `3-1-add-a-product-to-the-cart.md` — `ready-for-dev`
  - Stories 3.2–3.5 — story files not yet created (will be created at start of Dev pass)

## Notes / Blockers

- Epic 1 and 2 implemented with per-story Dev→QA loop (old rule). Starting
  Epic 3, the loop is now **per-epic**: Dev implements all stories + UT, then
  QA creates E2E tests + does manual localhost check, loop until both pass.
- User confirmed Epic 3 → 4 → 5 sequencing (original order). User had asked
  about reordering but reverted to original after learning about dependency
  constraints (Epic 4 stories 4.4/4.5 require Epic 3 cart service).
- User requested: show Dev↔QA cycle count at each epic gate. Tracked in the
  Epic Loop table above.
