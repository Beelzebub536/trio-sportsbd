---
description: Build one task of the plan. Usage - /build 3.2  (phase 3, task 2)
agent: build
---
Read AGENTS.md rules (already loaded), then docs/PROGRESS.md.
Open docs/PROMPTS.md and find the task numbered **$ARGUMENTS** (format PHASE.TASK, for example 3.2). Read only that task and the "Shared context" at the top of its phase.
Load the skills the task needs. Check library docs with context7 before writing code that uses Next.js, Prisma, Better Auth or shadcn.
Implement ONLY that task. Then run `npx tsc --noEmit` and `npm run lint` (and `npm run build` if the task says so), fix all errors, update docs/PROGRESS.md, commit with git, and reply with: what was done, files changed, how I can test it, and the next task number. Stop there.
