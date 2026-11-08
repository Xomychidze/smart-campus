# Task #01 - Codebase analysis (v1 baseline)

Baseline commit: `b82d77c` (tag `v1-baseline`). All line numbers refer to that commit.

## 1. Repository map (context given to the AI assistant)

```
v1-initial/
├── index.html   (38 lines)  page markup + inline CSS; loads script.js
└── script.js    (91 lines)  everything else
    ├── room (L5-14)                 data: one room R101, 3 frozen bookings
    ├── NOW (L16)                    fixed "current time" constant
    ├── toMinutes(t) (L18)           "HH:MM" -> minutes
    ├── checkAvailability() (L23)    DOM read + AC1 + AC2 + AC3 + AC4 + DOM write
    └── click handler (L71)          DOM read + partial AC1/AC2 re-check, then calls checkAvailability()
```

## 2. Acceptance criteria and constraints given to the AI

- AC1 valid time (HH:MM, start < end)
- AC2 maximum 120 minutes
- AC3 blocked room cannot be booked
- AC4 overlap = busy, touching boundaries = free
- AC5 booking data immutable
- AC6 clear, responsive feedback
- Constraints: no login, payments, live APIs or database; fictional data only; no full rewrite - small steps.

## 3. Baseline evidence

`docs/baseline-v1-results.txt`: 9/9 manual-equivalent checks pass (AC1, AC2 at 120/121, AC4 overlap and touching).
Automated test suite: none (0 tests). Size: 38 + 91 = 129 lines.

## 4. Maintainability risks (with file/function references)

| # | Risk | Evidence | Impact |
|---|------|----------|--------|
| R1 | **Duplicated validation** | `script.js` click handler L77-89 re-implements the empty-input check and the 120-minute check that `checkAvailability()` already does (L29-L47). The literal `120` and the message "Booking cannot be longer than 120 minutes." appear twice (L43/L45 and L84/L86). | Changing the limit in one place and forgetting the other creates inconsistent behaviour. |
| R2 | **Business rules mixed with DOM** | `checkAvailability()` reads `document.getElementById` (L24-L26) and writes `box.className`/`box.textContent` in 8 places (L30-L86). Rules cannot be called without a browser. | Rules cannot be unit-tested in Node; every test needs a DOM. |
| R3 | **Hard-wired single-room data** | `checkAvailability()` reads the global `room` (L5) directly (L48, L55-L60). It takes no room parameter. | Adding more rooms (new feature) would force edits inside the rule code and risks using another room's bookings. |
| R4 | **Duplicated rendering logic** | 8 separate `box.className = ...; box.textContent = ...` pairs (L30, 37, 44, 51, 61, 67, 78, 85). | Any change to result styling or ARIA must be repeated 8 times. |
| R5 | **Dead / unused config** | `NOW` (L16) is declared but never read; the fixed time exists only in the HTML text (`index.html` L28). | Misleading constant; two sources of truth for "current time". |
| R6 | **Time regex duplicated inline** | The same regex literal appears twice in one condition (L29). | Minor, but easy to desynchronize. |

## 5. Prioritized improvement plan (before editing code)

| Priority | Step | Fixes | Reason |
|----------|------|-------|--------|
| P1 | Add automated tests around the **current** behaviour (AC1-AC5) | - | Safety net before any refactoring |
| P1 | Extract constants to `config.js` (MAX_DURATION=120, NOW) | R1, R5 | Smallest change, removes magic numbers |
| P1 | Extract time validation to `rules/validation.js`, single source for both checks | R1, R6 | Removes the duplicated validation |
| P1 | Extract overlap/blocked logic to `rules/availability.js`, taking `room` as an argument | R2, R3 | Needed before multiple rooms |
| P2 | Move room data to `data/rooms.js` (4+ rooms, each with own bookings) | R3 | Prepares the new feature |
| P2 | One `render.js` function for results | R4 | Single place for UI feedback |
| P2 | Add `rules/filters.js` (capacity, equipment), room selector, empty state | New F1-F5 | The new feature, built on clean modules |
| P3 | Tests for F1-F5, integration test, quality comparison table | - | Evidence for the report |

Order rule: refactor one step at a time, run tests and review the diff after each, commit after each.

## 6. AI suggestion that was modified/rejected

> **To be confirmed by the student (must reflect what really happened).**
> Candidate from this session: the assistant's first plan said a UI-level integration test could use `jsdom`.
> Decision: modified - no dependency is added; the integration test runs at the orchestrator level (`runCheck(state)`) with Node's built-in `node --test`, plus a manual UI checklist.
> Reason: assignment requires "setup, run and test commands"; zero dependencies means `node --test` works on any machine without `npm install`.
