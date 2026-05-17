# Story 1.1: Scaffold the Next.js application

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the project initialized from the official starter with the architecture's pinned configuration,
so that every following story builds on a consistent, known-good base.

## Acceptance Criteria

1. **Scaffold with the pinned configuration.** The project is initialized with `create-next-app` configured for TypeScript, TailwindCSS, ESLint, the App Router, a `src/` directory, Turbopack, and the `@/*` import alias — matching ADR-001. [Source: architecture.md#ADR-001, epics.md#Story-1.1]
2. **The app boots.** `npm run dev` starts the app and it renders a page in the browser with no errors in the terminal or browser console. [Source: epics.md#Story-1.1 AC1]
3. **Strict typing and clean lint.** TypeScript is in `strict` mode and `npm run lint` passes on the freshly scaffolded code with zero errors. [Source: epics.md#Story-1.1 AC1, CLAUDE.md#1-Code-Quality]
4. **Production build succeeds.** `npm run build` completes successfully. [Source: architecture.md#Infrastructure-and-Deployment, NFR-M1]
5. **Pinned versions, nothing extra.** Installed dependency versions match the architecture's pinned stack — Next.js `16.2.x`, React `19.2.x` — and no dependencies beyond what `create-next-app` installs for the configured flags are added in this story. [Source: architecture.md#ADR-001, epics.md#Story-1.1 AC2]
6. **Existing BMAD artifacts preserved.** The pre-existing `_bmad/`, `_bmad-output/`, `.claude/`, `docs/`, and `CLAUDE.md` at the project root are untouched and intact after scaffolding. [Source: project layout — greenfield with planning artifacts already present]

## Tasks / Subtasks

- [x] **Task 1: Scaffold the Next.js app into the existing project root** (AC: #1, #6)
  - [x] Run `create-next-app` in a temporary directory (the project root is **not empty** — it already holds `_bmad/`, `_bmad-output/`, `.claude/`, `docs/`, `CLAUDE.md` — so `create-next-app` cannot scaffold directly into it without conflicts). Command: `npx create-next-app@latest bmad-scaffold-tmp --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm` (run from `/tmp` or a sibling path).
  - [x] Move the generated files from `bmad-scaffold-tmp/` into the project root `/home/viettung/Code/Study/bmad_demo/`, **without** overwriting or deleting the existing `_bmad/`, `_bmad-output/`, `.claude/`, `docs/`, or `CLAUDE.md`. This includes `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts`, `.gitignore`, `src/`, `public/`, `AGENTS.md`, and `README.md`.
  - [x] If `create-next-app` produced a `.gitignore` or `README.md`, keep the generated ones (this project has no git repo; the generated `.gitignore` is still fine to keep for future use).
  - [x] Set the `name` field in `package.json` to `bmad_demo`.
  - [x] Delete the temporary `bmad-scaffold-tmp/` directory.
- [x] **Task 2: Verify the pinned configuration** (AC: #1, #3, #5)
  - [x] Confirm `tsconfig.json` has `"strict": true`.
  - [x] Confirm `tsconfig.json` `paths` maps `@/*` to `./src/*`.
  - [x] Confirm the App Router (`src/app/`), TailwindCSS (v4, `@import "tailwindcss"` in `src/app/globals.css`), and ESLint config are all present.
  - [x] Confirm `package.json` shows `next` at `16.2.x` and `react` / `react-dom` at `19.2.x`. If `create-next-app` installed a newer minor, that is acceptable only if still `next@16.2.x` / `react@19.2.x`; otherwise pin explicitly to the architecture's versions.
  - [x] Confirm no dependencies beyond the `create-next-app` defaults for these flags were added.
- [x] **Task 3: Verify the app builds, lints, and boots** (AC: #2, #3, #4)
  - [x] Run `npm install` (clean install) and confirm it succeeds.
  - [x] Run `npm run lint` — must pass with zero errors.
  - [x] Run `npm run build` — must complete successfully.
  - [x] Run `npm run dev`, confirm the dev server starts and the default page renders without terminal or browser-console errors, then stop the server.
- [x] **Task 4: Record verification evidence** (AC: all)
  - [x] Capture the output of `npm run lint`, `npm run build`, and the `npm run dev` startup line in the Dev Agent Record → Completion Notes.

## Dev Notes

### What this story is — and is not

This is the **first story of a greenfield project**. There is no application code yet — only the BMAD planning artifacts under `_bmad-output/planning-artifacts/` and the BMAD tooling under `_bmad/` and `.claude/`. This story produces **only the scaffold**. Do **not** add Prisma, tRPC, shadcn/ui, a test runner, or any feature code — those are explicitly later stories (1.2, 1.3, 1.4). Keep this change to one thing: a working, pinned Next.js scaffold. [Source: epics.md#Epic-1, architecture.md#Decision-Impact-Analysis]

### Critical constraint — the project root is not empty

`create-next-app` refuses to scaffold into a directory containing arbitrary conflicting files. The project root already contains `_bmad/`, `_bmad-output/`, `.claude/`, `docs/`, and `CLAUDE.md`. **Do not** delete or move any of those to make room. Scaffold into a temp directory and move the generated files in (Task 1). Losing the planning artifacts in `_bmad-output/` would be a project-ending mistake — they are the source of every following story.

### The exact starter command (ADR-001)

```bash
npx create-next-app@latest <target> \
  --typescript --tailwind --eslint --app --src-dir --turbopack \
  --import-alias "@/*" --use-npm
```

This is the architecture's mandated configuration. It produces: TypeScript in `strict` mode, TailwindCSS v4 (CSS-first `@theme`), ESLint with the Next.js config, App Router under `src/app/`, the `@/*` → `src/*` alias, Turbopack (stable default for `dev` and `build` in Next.js 16), and a scaffolded `AGENTS.md`. [Source: architecture.md#Starter-Template-Evaluation, #ADR-001]

### Pinned versions (verified 2026-05-14)

| Package | Pinned version |
|---|---|
| `next` | 16.2.x (App Router, Turbopack default) |
| `react`, `react-dom` | 19.2.x |
| TailwindCSS | v4 |
| TypeScript | current, `strict` |

`create-next-app@latest` is expected to install exactly these majors. If it installs a different major (e.g. Next.js 17), **stop and flag it** — the architecture pins Next.js 16.2.x and the rest of the plan assumes it. [Source: architecture.md#Verified-Technology-Versions]

### Project structure notes

After this story, the root will hold the standard `create-next-app` layout — `src/app/` (with `layout.tsx`, `page.tsx`, `globals.css`), `public/`, and the root config files — alongside the untouched BMAD directories. Later foundational stories extend `src/` per the architecture's full project tree: Story 1.2 adds `prisma/` and `src/server/db.ts`; Story 1.3 adds `src/server/{trpc,context,root}.ts`, `src/server/routers/`, `src/server/services/`, `src/app/api/trpc/[trpc]/route.ts`, and `src/lib/trpc/`; Story 1.4 adds `src/components/ui/` and the token layer. Do **not** pre-create any of those directories now. [Source: architecture.md#Project-Structure-and-Boundaries]

### Testing standards

This story has **no application logic to unit-test** — it is pure scaffolding. Acceptance is verified by the toolchain itself: `npm run lint` (clean), `npm run build` (succeeds), `npm run dev` (boots and renders). A unit-test runner (Vitest) is **not** set up in this story; it is introduced when the first testable code appears in a later foundational story. Record the lint/build/dev output as evidence in the Dev Agent Record. [Source: architecture.md#Infrastructure-and-Deployment; CLAUDE.md#2-Testing-pyramid — applies once there is logic to test]

### Code quality

The scaffolded output is generated by the official tool and should already satisfy CLAUDE.md §1 (clean code, meaningful names, no dead code). Do not hand-edit the generated files beyond the `package.json` `name` field. If `npm run lint` flags anything in generated code, prefer the project-standard fix over disabling the rule. [Source: CLAUDE.md#1-Code-Quality-Standards]

### References

- [Source: epics.md#Epic-1 — Project Foundation & Scaffolding; Story 1.1 user story + ACs]
- [Source: architecture.md#ADR-001 — Pinned full-stack TypeScript stack]
- [Source: architecture.md#Starter-Template-Evaluation — selected starter, init command, decisions provided]
- [Source: architecture.md#Verified-Technology-Versions — Next.js 16.2.x, React 19.2]
- [Source: architecture.md#Project-Structure-and-Boundaries — target tree this scaffold seeds]
- [Source: architecture.md#Decision-Impact-Analysis — implementation sequence: scaffold first]
- [Source: prd.md#Project-Type-and-Technical-Constraints — fixed stack constraint; SC5 setup contract]
- [Source: CLAUDE.md#1, #2 — code quality and large-system rules]

## Dev Agent Record

### Agent Model Used

claude-opus-4-7

### Debug Log References

- Temp-dir scaffold required because `create-next-app` refuses a non-empty
  target — scaffolded in `/tmp/bmad-scaffold-tmp`, then moved files in.
- `create-next-app` generated its own stub `CLAUDE.md` (contents: `@AGENTS.md`)
  and a `.git/` directory. **Neither was moved into the project root** — the
  existing project `CLAUDE.md` (operating rules, 5270 bytes) is preserved, and
  the project stays git-less per project memory. `.next/` build cache was also
  not moved and was cleaned after verification.

### Completion Notes List

Story 1.1 complete — all 6 acceptance criteria met. Verification evidence:

- **AC1 — Scaffold config:** `npx create-next-app@latest` run with
  `--typescript --tailwind --eslint --app --src-dir --turbopack
  --import-alias "@/*" --use-npm`. Produced App Router (`src/app/`),
  TailwindCSS v4 (`@tailwindcss/postcss`, `@import "tailwindcss"` in
  `globals.css`), ESLint flat config, `src/` layout, `@/*` alias.
- **AC2 — App boots:** `npm run dev` → `▲ Next.js 16.2.6 (Turbopack) · ✓ Ready
  in 208ms`. `curl http://localhost:3000` → `HTTP 200`, 16,872-byte page,
  `<title>Create Next App</title>` rendered. No terminal errors.
- **AC3 — Strict + lint:** `tsconfig.json` has `"strict": true`; `npm run lint`
  → exit code 0, zero errors.
- **AC4 — Build:** `npm run build` → `✓ Compiled successfully in 1552ms`,
  TypeScript checked, 4 static pages generated, build finalized with no errors.
- **AC5 — Pinned versions:** installed `next@16.2.6`, `react@19.2.4`,
  `react-dom@19.2.4` — match the architecture's pinned stack
  (Next.js 16.2.x / React 19.2.x). Dev deps are exactly the `create-next-app`
  defaults for these flags (`@tailwindcss/postcss`, `tailwindcss`, `eslint`,
  `eslint-config-next`, `typescript`, `@types/*`); nothing extra added.
- **AC6 — BMAD artifacts preserved:** `_bmad/`, `_bmad-output/`, `.claude/`,
  `docs/`, and the project `CLAUDE.md` (5270 bytes) confirmed intact and
  untouched after the move.

Scope held to the scaffold only — no Prisma, tRPC, shadcn/ui, test runner, or
feature code added (those are Stories 1.2–1.4). No unit tests authored: this
story introduces no application logic; acceptance is verified by the toolchain
(lint/build/dev), as the story spec directs.

### File List

New (project root):
- `AGENTS.md` — Next.js coding-agent rules (generated by create-next-app)
- `eslint.config.mjs`
- `.gitignore`
- `next.config.ts`
- `next-env.d.ts`
- `package.json` — `name` set to `bmad_demo`
- `package-lock.json`
- `postcss.config.mjs`
- `README.md`
- `tsconfig.json` — `strict: true`, `@/*` → `./src/*`
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- `src/app/favicon.ico`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- `node_modules/` — installed dependencies (gitignored)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-14 | Story 1.1 implemented — Next.js 16.2.6 app scaffolded into the project root via temp-dir, pinned stack verified, lint/build/dev all pass. Status → review. |
| 2026-05-14 | Independent QA review — gate **PASS**, all 6 ACs verified by re-inspection. Status → done. |

## QA Review (Independent)

**Reviewer:** QA persona, run independently of Dev per the project's dev/QA
independence rule — verified by re-inspecting the filesystem and re-running the
checks, not by trusting the Dev completion notes.
**Date:** 2026-05-14 · **Checklist:** `.claude/quality/checklists/qa.md`

### Gate Decision: ✅ PASS

| AC | Independent verification | Result |
|----|--------------------------|--------|
| AC1 | `tsconfig.json` → `strict: true`, `paths["@/*"] = ["./src/*"]`; `src/app/{layout,page}.tsx` present; `tailwindcss` imported in `globals.css`; `eslint.config.mjs` present | ✅ |
| AC2 | `npm run dev` re-run → `✓ Ready`, `curl localhost:3000` → HTTP 200, 16,872-byte HTML doc rendered, dev log clean (no "error") | ✅ |
| AC3 | `tsconfig` `strict: true` confirmed; `npm run lint` re-run → exit 0, zero output | ✅ |
| AC4 | `npm run build` re-run → static pages generated, build finalized, no errors | ✅ |
| AC5 | `require('next/package.json').version` → 16.2.6; react / react-dom → 19.2.4; dev-deps are exactly the create-next-app defaults | ✅ |
| AC6 | `_bmad/`, `_bmad-output/`, `.claude/`, `docs/` all present; `CLAUDE.md` = 5270 bytes (the project rules, not the 11-byte scaffold stub); planning artifacts intact | ✅ |

**Findings:** none — blocker 0, major 0, minor 0. Clean review.

**Notes:** Story has no application logic, so no test-coverage trace applies —
acceptance is correctly toolchain-verified (lint/build/dev), consistent with the
story spec. Scope was held to the scaffold; no unrelated changes. The Dev's
sound decisions to exclude the generated `CLAUDE.md` stub and the `.git/` dir
were independently confirmed correct. **Story may proceed — no loop back to Dev.**
