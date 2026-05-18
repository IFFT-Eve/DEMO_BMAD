# Dev Checklist — story implementation, code changes

Persona: Developer (Amelia). Artifacts: implemented story, code changes, updated
story file.

- **(critical)** Every acceptance criterion in the story is fully implemented
  and demonstrably met.
- **(critical)** Tests exist for the new/changed behavior and all tests pass
  (unit + integration as appropriate); ACs are traceable to tests.
- **(critical)** Code complies with `CLAUDE.md` Section 1 (clean code, meaningful
  names, minimal comments) and Section 2 (large-system rules).
- **(critical)** No secrets, credentials, or PII in code, config, or logs.
- Error handling and edge cases (empty, null, boundary, failure, concurrent) are
  covered — not just the happy path.
- No dead code, no commented-out blocks, no leftover debug logging or `console`
  noise.
- Inputs at boundaries are validated; external calls have timeouts.
- Follows existing project patterns, structure, and conventions.
- Lint/format clean; build succeeds (once tooling is configured).
- The story file is updated: tasks checked off, file list accurate, status and
  completion notes current.
- The change is scoped to the story — no unrelated changes smuggled in.

### Epic 3+ Additional Requirements

> These items are **required from Epic 3 onwards**. They are checked in addition
> to all items above.

- **(critical — Epic 3+)** All three test categories are present and labelled in
  unit tests, integration tests, and Playwright: normal cases, edge cases, and
  abnormal/failure cases.
- **(critical — Epic 3+)** Every AC in the story is fully implemented this pass —
  no ACs are deferred. The story file confirms all ACs are done.
- **(critical — Epic 3+)** Dev output is presented as a self-contained
  **DEV section** (per CLAUDE.md §6.3) — clearly separated from the QA section.
