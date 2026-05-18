# QA Checklist — test suites, code review, QA gate decisions

Personas: Test Architect (Murat / TEA), Code Review. Artifacts: automated test
suites, code review report, QA gate decision.

- **(critical)** Every acceptance criterion is traced to at least one test;
  coverage gaps are reported, not hidden.
- **(critical)** Tests exercise happy path, edge cases, and failure/error paths
  — not just the success case.
- **(critical)** The gate decision (pass / concerns / fail) is explicit and
  justified by evidence from the review.
- **(critical)** All findings are logged with severity (blocker / major / minor)
  and a concrete location or repro.
- Tests are deterministic, isolated, and free of flakiness (no order
  dependence, no real network/time reliance unless intended).
- Tests assert meaningful behavior, not implementation trivia; no empty or
  always-pass tests.
- Regression risk is considered — existing behavior still covered.
- Review checks code against `CLAUDE.md` Sections 1 & 2, security, and
  performance hot paths.
- Blockers and majors come with a clear, actionable fix recommendation.
- The summary states unambiguously whether the story can proceed or must loop
  back to Dev.

### Epic 3+ Additional Requirements

> These items are **required from Epic 3 onwards**. They are checked in addition
> to all items above.

- **(critical — Epic 3+)** Test suite explicitly covers and labels all three
  categories for every AC: normal cases, edge cases, and abnormal/failure cases
  — in unit tests, integration tests, and Playwright E2E.
- **(critical — Epic 3+)** A **test plan** is produced before any test
  implementation: scope, test types (unit / integration / E2E), tools, risk
  areas, and entry/exit criteria.
- **(critical — Epic 3+)** Every manual TC is traced to an automated test, or
  carries a documented rationale for why it remains manual-only.
- **(critical — Epic 3+)** Each defect is logged with: title, severity, repro
  steps, expected vs. actual result, environment, and a suggested fix.
- **(critical — Epic 3+)** A **regression sweep** is documented — which existing
  flows were checked and the result (pass / risk identified / fail).
- **(critical — Epic 3+)** Gate sign-off is explicit: pass / pass with conditions
  / fail, with full open-defect list and tester confidence %.
- **(critical — Epic 3+)** Gate evaluates **all** ACs in the story — no ACs are
  treated as deferred or out-of-scope.
- **(critical — Epic 3+)** QA output is presented as a self-contained **QA
  section** (per CLAUDE.md §6.3) — clearly separated from the Dev section,
  followed by a CYCLE N RESULT block showing pass/fail and next action.
