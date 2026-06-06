# Project Rules

## General Rules

Code implementation only. Do not provision accounts, configure
third-party services, set up DNS, or perform manual infrastructure
steps. Flag those as requiring human action.

The **GitHub issue** is the source of truth for every story. Read the
issue body first. Only consult reference docs for cross-cutting
concerns not covered in the issue.

## Project Context

React Native / Expo mobile app template — project-agnostic scaffold consolidating
patterns from CadenceReader, Refrain, and VantagePoint. Windows-first toolchain
(PowerShell scripts + `.cmd` wrappers). See `.decisions/` for locked decisions.

**Non-negotiable:** Single source of truth + seams. Every visual value
(colors, font sizes, spacing, radii, shadows) is defined ONCE in `src/theme`.
Components are generic and prop-driven (`variant`/`size`/`tone`/`style`),
read tokens via `useTheme()`, and **never hardcode values**.
Re-skinning = token edit, not component edit.

## Autonomous Execution

Execute the full story workflow end-to-end without pausing for
confirmation. Skills are planning aids — consume their output and
continue to implementation. Never stop to ask "Ready to implement?"

## Story Execution

Work on **one story at a time** in a **fresh session per story**.
Complete it (PR created) or mark it blocked before starting the next.

### Build Principles

- One responsibility per file.
- Domain must not import from infrastructure. Strict layer boundaries.
- Every module unit-testable in isolation. Inject dependencies.
- Search for existing utilities before creating new ones.
- Write tests alongside the code, not after.
- Components use `App*` prefix (AppButton, AppText, AppIcon, …).
- State: React Context for theme/a11y; Zustand (injectable-deps pattern) for domain state.
- TypeScript strict mode — no `any`, no `// @ts-ignore`.
- Scripts: PowerShell (`.ps1`) with a matching double-click `.cmd` wrapper.

### Chaining Stories

When a story depends on another unmerged story:

1. Build the dependency on its own branch from the default branch.
2. Branch the dependent story off the dependency branch.
3. Set the dependent PR's base to the dependency branch.
4. After merge, rebase onto the default branch and update the PR base.

## Bug, Security, and Maintenance Workflow

When a bug, security issue, architecture violation, or tech debt is found during
development:

- **Trivial and same scope**: Fix in the current PR.
- **Everything else**: Run `/github-workflow:report-issue` to create
  a GitHub issue. Never silently skip problems.
- **Blocks current story**: Fix it first on its own branch.

## Session Hygiene

- Start a **new session** for each story.
- Target **~100k tokens per session**. One story, one session. Commit
  and push progress early so work survives session boundaries.
- If a story is too large for one session, implement the most important
  slice, open a PR for it, and create follow-up issues for the rest.

## Supplementary Files

| File                                       | When to consult                                                                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClaudeProject.md`                         | Project identity, labels, quality gate, branch convention, board config. Read at the start of any workflow command.                                               |
| `docs/review.config.md`                    | Review label definitions, non-compliance gates, tech-stack review rules. Read when performing or preparing for code review.                                       |
| `.decisions/mobile-template-2026-06-06.md` | Architecture decisions: Expo SDK version, theme system, a11y requirements, build toolchain, state management. Consult before making cross-cutting design choices. |
