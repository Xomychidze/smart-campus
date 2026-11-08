# Smart Campus - Room Availability Checker (Assignment #04)

Refactoring and extension of a small prototype. All data is fictional. No login, payments, live APIs or database.

## Repository layout

| Path | Content |
|------|---------|
| `v1-initial/` | Initial version: one room, everything in `script.js` (git tag `v1-baseline`, commit `b82d77c`) |
| `v2-final/` | Final version: modules, 5 rooms, filters, tests |
| `docs/` | Analysis, design decisions, metrics, AI evidence, raw test output, screenshots |

## Setup and run

Requirements: Node.js 20+ (tested with 22). No `npm install` is needed - there are no dependencies.

**Run v2 in the browser** (ES modules need a local server, `file://` will not work):

```bash
cd v2-final
python3 -m http.server 8080      # or: npx serve .
# open http://localhost:8080
```

**Run v1**: open `v1-initial/index.html` directly in a browser.

## Run the tests

```bash
cd v2-final
node --test
```

Expected: `# tests 41`, `# pass 41`, `# fail 0`. Raw output of the last run: `docs/test-results.txt`.

## Features (v2)

- AC1 valid time, AC2 max 120 minutes, AC3 blocked room, AC4 overlap (touching = free), AC5 immutable data, AC6 clear messages and responsive layout.
- Room catalog: 5 fictional rooms, each with its own bookings (one room is blocked).
- Filters: capacity (>= attendees) and equipment (room must have all selected items).
- Empty state when no room matches; result refreshes or clears when the room changes.

## Git history

```bash
git log --oneline
```

Each refactoring step is a separate commit with passing tests.
