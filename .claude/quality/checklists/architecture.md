# Architecture Checklist — architecture, solution design, ADRs, UX specs

Personas: Architect (Winston), UX Designer (Sally). Artifacts: architecture
document, solution design, ADRs, UX design spec.

- **(critical)** Every PRD requirement and NFR is addressed by an architectural
  decision — full coverage, no gaps.
- **(critical)** Components, their responsibilities, and their boundaries are
  defined; dependency direction is explicit and acyclic.
- **(critical)** Significant technology choices are justified with trade-offs
  (why this, why not the alternatives) and recorded as ADRs.
- **(critical)** No ambiguous `TBD` on decisions the Dev persona needs to start.
- Data model / schema is defined; ownership of each data store is clear.
- API / interface contracts between components are specified (inputs, outputs,
  errors).
- NFRs are designed for: scalability, performance budgets, availability/SLA,
  security model (authn/authz, secrets, data protection), observability.
- Failure modes and resilience are addressed (timeouts, retries, fallbacks,
  degradation).
- Deployment, environments, and configuration strategy are described.
- The design honors the large-system rules in `CLAUDE.md` Section 2 (layering,
  separation of concerns, statelessness, contracts).
- (UX) User flows cover primary, edge, empty, error, and loading states;
  accessibility is considered; the spec is consistent with the PRD.
- The architecture is feasible within stated constraints and not
  over-engineered for the actual requirements.
