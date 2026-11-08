# AI evidence appendix

| Field | Value |
|-------|-------|
| AI tool / model | Claude (Anthropic), claude.ai chat and Claude Code, model `claude-sonnet-5-5` |
| Date | 2026-11-08 |
| Student review | All outputs were reviewed by the student; see "Verification" |

## Prompts (summary)

| # | Prompt summary | Output used | Problems found / changes made |
|---|----------------|-------------|-------------------------------|
| 1 | "Help with the assignment, give a full step-by-step plan" (+ assignment PDF) | Stage plan, acceptance-criteria list, test list | Plan listed `jsdom` as an optional UI-testing tool; rejected, used an injected document + a small fake DOM (no dependencies) |
| 2 | "Start step by step": create structure, recreate v1, baseline | `v1-initial/` (recreated, **not** the original Assignment #03 prototype), baseline harness | v1 is a reconstruction; stated in the report |
| 3 | Analyze v1 for maintainability risks | 6 risks with line references, P1-P3 plan (`docs/01-codebase-analysis.md`) | Line references verified with `grep -n`; section 6 of that file was corrected by the student to match what really happened |
| 4 | Refactor and extend: config, validation, availability, rooms, filters, UI, tests | `v2-final/` (4 commits, one per step) | Browser check showed an apparent bug that was correct behaviour (validation before availability); documented |
| 5 | Draft metrics table and reflection | `docs/02-design-and-metrics.md`, `docs/03-ai-reflection.md` | Reflection was drafted by the AI; the student rewrote, corrected and finalized it |
| 6 | Gave repo map, AC1-AC6 and constraints; asked for risks, P1-P3 plan, file structure and test approach (claude.ai chat) | Risks, plan, fake-DOM test approach | The draft of section 6 contained an inaccurate claim (`runCheck(state)`); I checked the code and corrected it |

## Verification sources

- `node --test` in `v2-final`: 41 tests, 41 pass (`docs/test-results.txt`).
- v1 baseline harness: 9/9 (`docs/baseline-v1-results.txt`).
- Real-browser run with Playwright at 375 px: no console errors, no horizontal overflow (`docs/browser-check-results.txt`, screenshots).
- `git log` / `git diff` for every step; `grep` for duplicated constants and DOM access in rules.

## Changes made after AI output

- Replaced jsdom suggestion with a dependency-free fake DOM.
- Fixed a misleading comment in `tests/integration.test.js` found while re-reading the diff.
- Rewrote the reflection so it matches what really happened (it does not claim that tests found a bug; they confirmed the design).
