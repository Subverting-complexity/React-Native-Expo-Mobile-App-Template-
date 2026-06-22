# Project Configuration

Settings for the `github-workflow` plugin. All commands and the
execute skill read this file.

## Identity

| Setting        | Value                                    |
| -------------- | ---------------------------------------- |
| org            | `Subverting-complexity`                  |
| repo           | `React-Native-Expo-Mobile-App-Template-` |
| default-branch | `main`                                   |

## Package Manager

`npm`

## Quality Gate

Command to run before each commit:

```
npm run quality
```

## Branch Convention

Pattern for feature branches:

```
feature/{number}/{short-description}
```

Example: `feature/11/expo-project-scaffold`

## Label Map

Map workflow purposes to your repository's actual label names.

### Priority

| Purpose           | Label               |
| ----------------- | ------------------- |
| priority-critical | `priority-critical` |
| priority-high     | `priority-high`     |
| priority-medium   | `priority-medium`   |
| priority-low      | `priority-low`      |

### Type

| Purpose       | Label           |
| ------------- | --------------- |
| type-story    | `story`         |
| type-bug      | `bug`           |
| type-security | `type-security` |
| type-debt     | `type-debt`     |
| type-arch     | `type-arch`     |

### Status (issue lifecycle)

Every issue always carries exactly one of these lifecycle labels.

| Purpose                | Label                    |
| ---------------------- | ------------------------ |
| status-ready           | `status-ready`           |
| needs-refinement       | `needs-refinement`       |
| status-in-progress     | `status-in-progress`     |
| status-parked          | `status-parked`          |
| status-blocked         | `status-blocked`         |
| status-in-review       | `status-in-review`       |
| status-needs-attention | `status-needs-attention` |

### Claude

| Purpose         | Label             | Applied by                                               |
| --------------- | ----------------- | -------------------------------------------------------- |
| claude-authored | `claude-authored` | finish-story (PRs), report-issue / finish-story (issues) |

## Ready Gate

| Setting    | Value  |
| ---------- | ------ |
| ready-gate | `none` |

Any open unassigned issue is eligible for autonomous pickup.

## Agent Gating

| Setting      | Value      |
| ------------ | ---------- |
| agent-gating | `disabled` |

## Refinement

| Setting          | Value               |
| ---------------- | ------------------- |
| refinement-skill | `feature-discovery` |

## Session Budget

Agent sessions should target ~100k tokens. One story per session.

## Story Template

Issues should include these sections at minimum:

1. **Context** — What this is about and why it matters
2. **Requirements** — Acceptance criteria and constraints
3. **Notes** (optional) — Dependencies, references, edge cases

## Issue Prefixes

| Type         | Prefix       |
| ------------ | ------------ |
| Story        | `[STORY]`    |
| Bug          | `[BUG]`      |
| Security     | `[SECURITY]` |
| Architecture | `[ARCH]`     |
| Tech Debt    | `[DEBT]`     |

## Project Board

| Setting             | Value                            |
| ------------------- | -------------------------------- |
| project-number      | `10`                             |
| project-title       | `Mobile App Template`            |
| project-node-id     | `PVT_kwDODj6aos4BZ4n6`           |
| status-field-id     | `PVTSSF_lADODj6aos4BZ4n6zhU0LQ0` |
| start-date-field-id | `n/a`                            |
| end-date-field-id   | `n/a`                            |

### Status Options

| Status      | Purpose key       | Option ID  |
| ----------- | ----------------- | ---------- |
| Todo        | `col-backlog`     | `f75ad846` |
| Ready       | `col-ready`       | `n/a`      |
| In Progress | `col-in-progress` | `47fc9ee4` |
| In Review   | `col-in-review`   | `9e153c55` |
| Blocked     | `col-blocked`     | `9d4c7dc9` |
| Done        | `col-done`        | `98236657` |

## Reference Docs

- `.decisions/mobile-template-2026-06-06.md` — Architecture decisions and locked design choices for this template (Expo SDK, theme, a11y, build toolchain, state management)
- `docs/review.config.md` — Code review configuration and non-compliance gates
