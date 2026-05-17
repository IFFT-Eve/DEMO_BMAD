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
