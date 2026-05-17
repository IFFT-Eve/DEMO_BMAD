# Analysis Checklist — briefs, PRDs, epics & stories, research

Personas: Analyst (Mary), PM (John). Artifacts: product brief, PRD, epics &
stories, market/domain/technical research.

- **(critical)** The core problem and the target user/persona are clearly
  defined.
- **(critical)** Scope boundaries are explicit — what is in, what is out.
- **(critical)** Success is measurable — concrete, quantified metrics, not vague
  goals.
- **(critical)** Functional requirements are specific, numbered/IDed, and
  testable.
- **(critical)** Every epic traces to PRD requirements; every story traces to an
  epic. No orphan requirements, no orphan stories.
- Stories have clear, verifiable acceptance criteria (each AC is independently
  checkable).
- Stories are appropriately sized and independently valuable; dependencies
  between stories are noted.
- Non-functional requirements (performance, security, scale, availability,
  compliance) are captured, not deferred silently.
- Assumptions, constraints, and open risks are listed.
- Edge cases and error/empty/failure scenarios are considered, not just the
  happy path.
- Priority/sequencing of epics and stories is stated and justified.
- No solutioning baked into requirements where it shouldn't be (requirements say
  *what*, not *how*) — unless the artifact is explicitly a design doc.
