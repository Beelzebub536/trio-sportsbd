---
description: Full health check - typecheck, lint, build, and a review against the rules
agent: build
---
Run `npx tsc --noEmit`, `npm run lint`, `npm run build`. Fix every error you find.
Then review the code written so far against AGENTS.md: any admin action missing `requireAdmin()`, any price/total taken from the client, any file over 250 lines, any unused dependency, any secret in code. Fix what you find, update docs/PROGRESS.md, commit, and report briefly.
