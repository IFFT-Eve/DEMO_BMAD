# CLAUDE.md — Project Operating Rules

Project: **bmad_demo** — an application built using the BMAD method (analysis →
planning → solutioning → implementation) driven by BMAD persona skills.

This file is loaded into every Claude Code session. **Every persona, agent, and
skill — especially Analysis, Architecture, Dev, and QA — must follow these rules.**

---

## 1. Code Quality Standards

Write code that the next engineer can read without you in the room.

- **Clean code first.** Small functions, one responsibility each. If a function
  needs a paragraph to explain it, split it.
- **Meaningful names.** Variables, functions, classes, and files say what they
  are or do. No `tmp`, `data2`, `doStuff`, `mgr`, single letters (except trivial
  loop indices). Booleans read as predicates (`isReady`, `hasAccess`).
- **Minimal comments.** Code should be self-explanatory. Comment only the *why*
  (intent, trade-off, non-obvious constraint) — never the *what*. Delete
  commented-out code. No redundant docstrings that restate the signature.
- **DRY, but not clever.** Remove duplication; never sacrifice clarity for
  brevity. Readability beats line count.
- **No dead code.** No unused vars, imports, params, or unreachable branches.
- **Consistent style.** Match the surrounding file's conventions, formatting,
  and idioms. Defer to the project linter/formatter once configured.
- **No magic values.** Name constants. Centralize configuration.
- **Explicit error handling.** No silent catches. Fail loudly or handle
  deliberately; never swallow exceptions.
- **Small, reviewable changes.** Each change does one thing.

## 2. Large-System Engineering Rules

Build as if this will run in production at scale, owned by a team.

- **Separation of concerns / layering.** Keep presentation, business logic, and
  data access in distinct layers. Dependencies point inward (UI → domain → data,
  never the reverse).
- **Explicit contracts.** Define interfaces/types at module and service
  boundaries. Validate all inputs at the boundary; trust nothing external.
- **Statelessness & idempotency.** Prefer stateless components. Make write
  operations idempotent where feasible (retry-safe).
- **Resilience.** Every external call has a timeout. Use retries with backoff,
  circuit breakers, and graceful degradation. Assume dependencies fail.
- **Observability.** Structured logging (no secrets), meaningful metrics, and
  trace context across boundaries. Every error path is observable.
- **Security by default.** No secrets in code or config files — use env/secret
  stores. Least privilege. Validate and sanitize all input. Enforce authn/authz
  at every entry point. Never log PII or credentials.
- **Performance & scalability awareness.** Know the hot paths. Avoid N+1
  queries. Paginate large results. Cache deliberately with explicit invalidation.
- **Configuration over hardcoding.** Environment-specific values come from
  config/env, not source.
- **Backward compatibility.** Version APIs and schemas. Migrations are
  forward-only and reversible-by-design.
- **Testing pyramid.** Many fast unit tests, fewer integration tests, few E2E.
  Tests are deterministic and isolated. Every acceptance criterion is traceable
  to a test.
- **Document decisions.** Record significant architectural choices as ADRs in
  the architecture artifacts — context, decision, consequences.

> Stack-specific rules (language, framework, lint config) will be appended to
> this file once the Architecture phase defines the tech stack.

## 3. Persona Operating Rules

Every BMAD persona, before handing a deliverable to the user or the next
persona, **must**:

1. Follow Sections 1 & 2 above in all produced code and specifications.
2. Run the **Output Validation Protocol** (see Section 4) against its deliverable.
3. Self-score a **confidence percentage**. If confidence `< 80%` or any critical
   checklist item fails, **revise and re-check autonomously** — loop silently,
   do not interrupt the user mid-fix — until it passes.
4. Present the deliverable with a short **✅ Validation summary** (checklist
   result + final confidence %).

Personas automate their internal work (including retries). The **only** approved
stop point is presenting a completed, validated deliverable for user review.

## 4. Output Validation Protocol

Defined in `.claude/quality/validation-protocol.md`. Checklists per persona live
in `.claude/quality/checklists/`:

- `analysis.md` — briefs, PRDs, epics & stories, research
- `architecture.md` — architecture, solution design, ADRs, UX specs
- `dev.md` — story implementation, code changes
- `qa.md` — test suites, code review, QA gate decisions
- `general.md` — applies to every deliverable

A `Stop` / `SubagentStop` hook (`.claude/hooks/validate_persona_output.py`)
enforces this protocol as a backstop whenever a deliverable is written under
`_bmad-output/`.

## 5. Full-Pipeline Orchestration

To run the entire app-development flow end to end, use the **`bmad-orchestrator`**
skill. It chains the BMAD pipeline (analysis → PRD → architecture → epics &
stories → readiness → sprint plan → per-story dev/QA loop → review) and halts
only at each persona's validated output for your review.

---

## 6. Epic 3+ Pipeline Rules

The following rules apply to all Dev and QA work from **Epic 3 onwards**.
They extend — not replace — Sections 1–5.

### 6.1 Full Test Coverage (Normal + Edge + Abnormal)

Every story implementation and its test suite must cover **all three case categories**:

- **Normal cases** — intended happy-path behavior under valid, expected input.
- **Edge cases** — boundary values, empty inputs, min/max, concurrent requests,
  timing-sensitive paths.
- **Abnormal cases** — invalid input, malformed data, network/dependency failure,
  authorization violations, unexpected state, race conditions.

This applies to unit tests, integration tests, and Playwright E2E tests alike.
A test suite covering only normal cases fails the QA gate.

Every story's **full set of acceptance criteria must be implemented and tested**
in a single pass. No ACs are deferred.

### 6.2 QA Persona — Real-Life QA + AQA Workflow

QA work in Epic 3+ must reflect how a real **QA engineer and AQA (Automation QA)**
operate when handling a ticket:

1. **Test Planning** — before writing any test, produce a brief test plan:
   scope, test types (unit / integration / E2E), tools, risk areas, and
   entry/exit criteria.
2. **Manual → Auto traceability** — every manual test case (TC) must have a
   corresponding automated test, or a documented rationale for why it stays manual.
3. **Defect logging** — each finding is logged with: title, severity, steps to
   reproduce, expected vs. actual result, environment, and a suggested fix.
4. **Regression sweep** — explicitly verify whether the story's changes could
   break existing flows; document the scope and outcome.
5. **QA gate sign-off** — the gate decision states: pass / pass with conditions /
   fail, lists all open defects, and records the tester's confidence %.

### 6.3 Dev/QA Section Separation and Cycle Visibility

When presenting a Dev↔QA loop to the user, the output **must** be structured as
two visually distinct, self-contained sections followed by a cycle summary:

```
════════════════════════════════════════
 🔨 DEV — Cycle N
════════════════════════════════════════
[What was implemented / fixed this cycle]

════════════════════════════════════════
 🔍 QA — Cycle N
════════════════════════════════════════
[Test plan, findings, defect list, gate decision]

────────────────────────────────────────
 🔄 CYCLE N RESULT: PASS | FAIL → routing back to Dev
────────────────────────────────────────
```

- Each section is **self-contained** — the reader does not need to cross-reference the other section to understand it.
- If QA fails, the next Dev cycle starts a new numbered block; the total cycle count is always visible.
- The cycle loop is the **key deliverable of the process** — highlight it, do not bury it.
