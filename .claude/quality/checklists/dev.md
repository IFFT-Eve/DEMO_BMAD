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
