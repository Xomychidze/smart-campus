# Task #06 - AI reflection (DRAFT: the student must read, correct and own this text)

I used Claude (Claude Sonnet 5.5, Claude Code) on 2026-11-08. I gave it the assignment PDF, a repository map of v1, acceptance criteria AC1-AC6 and the constraints: no login, payments, APIs or database, fictional data only, and small steps instead of a rewrite.

Useful output: the risk list with line references (the 120-minute rule duplicated at script.js L43 and L84, DOM mixed with rules, eight repeated rendering blocks) and the plan to refactor in small commits with tests after each. Each risk can be checked against the code, so I verified them with grep. One suggestion I changed: the first plan proposed jsdom for UI tests. I replaced it with an injected document and a small fake DOM, so the project has no dependencies and `node --test` runs anywhere. I also had to decide an ambiguity myself: a blocked room stays visible in the list but is never reported as available.

What I checked myself: I ran all tests (41 of 41 pass), ran the v1 baseline harness, opened v2 in a real browser at 375 px width, and read each diff before committing. During the browser check one result looked wrong (switching to the blocked room showed a duration error). Investigation showed the old time range was still in the fields and validation runs before availability. The behaviour is correct, and I added it as a documented decision.

Tests and design: the boundary tests (120 and 121 minutes, touching intervals, exact capacity) all passed on the first run, so they confirmed the comparison operators rather than finding a bug. The room-switch integration tests proved that the result is refreshed or cleared for the new room instead of keeping an old answer.

Next improvements: persist bookings, handle past times against the current time, add a real end-to-end test in CI, and test accessibility.

<!-- Word count is checked in the next step; the limit is 200-300 words. -->
