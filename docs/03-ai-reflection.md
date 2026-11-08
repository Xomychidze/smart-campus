# Task #06 - AI reflection

I used Claude Sonnet 5.5 (Claude Code) on 2026-11-08 to improve my project. I gave it the assignment PDF, a repository map of the old code, acceptance criteria AC1-AC6 and the constraints (no login, payments, APIs or database, fictional data only). I asked for small changes instead of a full rewrite.

Claude found real problems in the code: the 120-minute rule duplicated in two places, rules mixed with DOM code, and eight repeated rendering blocks. I checked these myself with grep and then followed the plan step by step, with one commit per step. One suggestion I changed: the first plan mentioned jsdom for UI tests; I used a small fake DOM instead, so the project has no dependencies. I also made one decision myself: blocked rooms stay visible but are never shown as available.

After each change I ran the tests; all 41 pass. I opened the project in a browser at 375 px width and reviewed the diffs before committing. During testing I saw one strange result (a duration error after switching to the blocked room). I investigated: the old time was still in the fields and validation runs before availability, so the behaviour was correct, and I documented it.

The tests confirmed my boundary decisions (120 vs 121 minutes, touching intervals, exact capacity) and showed that room switching refreshes the result.

Next I would save bookings, prevent bookings in the past, add more browser tests and improve accessibility.