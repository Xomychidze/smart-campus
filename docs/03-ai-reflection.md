# Task #06 - AI reflection

I used Claude Sonnet 5.5 (claude.ai chat and Claude Code) on 2026-11-08 to improve my project. I gave it the assignment PDF, a repository map of the old code, acceptance criteria AC1-AC6 and the constraints (no login, payments, APIs or database, fictional data only). I asked for small changes instead of a full rewrite.

Claude found real problems: the 120-minute rule duplicated in two places, rules mixed with DOM code, and eight repeated rendering blocks. I checked them with grep, then followed the plan step by step, one commit per step. I rejected one suggestion: jsdom was offered as an optional UI-testing tool, and I kept a small fake DOM so the project has no dependencies. One AI statement was incorrect: the draft evidence text described `runCheck(state)`; I checked the code, found `runCheck(room, start, end)` and corrected it. I also decided myself that blocked rooms stay visible but are never shown as available.

After each change I ran the tests; all 41 pass. I checked the page in a browser at 375 px width and reviewed every diff before committing. One strange result (a duration error after switching to the blocked room) turned out to be correct: the old time stayed in the fields and validation runs before availability.

The tests confirmed my boundary decisions (120 vs 121 minutes, touching intervals, exact capacity) and showed that room switching refreshes the result.

Next I would add browser-level tests, block bookings in the past and improve accessibility. Saving bookings was out of scope for this assignment.