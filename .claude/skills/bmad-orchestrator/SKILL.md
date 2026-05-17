---
name: bmad-orchestrator
description: Fully automate the end-to-end BMAD app-development pipeline — analysis, PRD, architecture, epics & stories, readiness, sprint plan, and the per-story dev/QA loop — halting only at each persona's validated output for user review. Use when the user says "orchestrate the project", "run the full bmad pipeline", "automate the whole app", or "build the app end to end".
---

# BMAD Pipeline Orchestrator

Follow the instructions in `./workflow.md`.

This skill chains the BMAD persona skills into one automated pipeline. It runs
each persona's internal work autonomously — including retries and the dev↔QA
loop — and stops **only** to present a completed, validated deliverable for the
user to review and approve before the next persona begins.
