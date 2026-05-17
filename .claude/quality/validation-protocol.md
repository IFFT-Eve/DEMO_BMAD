# Output Validation Protocol

Run this before any BMAD persona deliverable reaches the user or the next
persona. It is a gate, not a suggestion.

## Steps

1. **Identify the deliverable & persona.** Which persona produced this (Analysis,
   Architecture, Dev, QA, or other)? What artifact is it?

2. **Select checklists.** Use the persona-specific checklist in
   `.claude/quality/checklists/` plus `general.md`. If the persona is not one of
   the four core ones, use the closest match plus `general.md`.

3. **Score every item.** Go item by item. Mark each `PASS`, `FAIL`, or `N/A`
   with a one-line justification. Items marked **(critical)** must be `PASS`.

4. **State confidence.** Give a single confidence percentage (0–100) that this
   deliverable is correct, complete, and ready for the next persona.

5. **Gate.**
   - If confidence `>= 80%` **and** all critical items `PASS` → the deliverable
     passes. Proceed to step 6.
   - Otherwise → **revise the deliverable now.** Fix the failing items. Do this
     autonomously and silently — do not ask the user to weigh in mid-fix. Then
     return to step 3. Repeat until it passes. Retrying many times is expected
     and acceptable; shipping unvalidated output is not.

6. **Present with a validation summary.** Show the deliverable followed by:

   ```
   ✅ Validation summary
   Checklist: <persona> + general — <N> passed, <M> N/A, 0 critical fails
   Confidence: <XX>%
   Notes: <anything the reviewer should know; "none" if clean>
   ```

## Rationale

Catching a weak deliverable here costs one re-check. Passing it downstream costs
re-doing every persona that built on top of it. Validate early, fail cheap.
