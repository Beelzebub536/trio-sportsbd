# trio-sportsbd + opencode: setup guide (Windows 11)

## 0. What this kit is
A ready-made "operating manual" so a free-tier model can build the whole store step by step without drifting.

```
trio-sportsbd-kit/
  AGENTS.md              rules opencode reads every session (kept short on purpose)
  opencode.json          MCP servers + safety permissions
  docs/PLAN.md           the full spec: stack, data model, routes, seed data
  docs/PROMPTS.md        ~35 small numbered tasks (phase.task), each with an acceptance test
  docs/PROGRESS.md       the agent's memory between sessions
  .opencode/commands/    /build  /verify  /resume
  .opencode/skills/      stack-gotchas, adidas-ui, orders-and-pricing
```
Why so many small pieces: free models have small effective context and different models answer on different turns (the proxy rotates providers). Short rules + one small task + a written progress log is what keeps the output consistent.

## 1. One-time setup

**Install** (PowerShell): Node.js 22 LTS, Git for Windows, and opencode (you already have it). Check: `node -v`, `git --version`.

**Create the project folder** and copy the whole kit into it (keep the hidden `.opencode` folder: in Explorer enable View > Show > Hidden items):
```powershell
mkdir C:\dev\trio-sportsbd
cd C:\dev\trio-sportsbd
# copy the kit contents here, so AGENTS.md sits directly in this folder
git init
```
Use a short path like `C:\dev\...` (not OneDrive/Desktop: sync and long paths cause random Prisma/Next errors on Windows).

**Start FreeLLMAPI first** (it must be running on `localhost:3001` while you work), then in the project folder:
```powershell
opencode
```
Select your FreeLLMAPI model with `/models`. If your existing opencode config already points at FreeLLMAPI, do not touch it; the project `opencode.json` in this kit only adds MCP servers and permissions and merges with it.

**Accounts to create now (all free)**
1. Neon (neon.tech): new project, copy the *pooled* and *direct* connection strings.
2. Cloudinary: copy cloud name, API key, API secret.
3. GitHub (for Vercel deploy later).
4. Google Cloud Console: OAuth client (web). Facebook: developers.facebook.com app. You can do these two in phase 9; email login works without them.
Put the values into `.env` yourself (the agent is told never to edit `.env`). Generate the auth secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 2. Models: how to use your four providers
The free tier is the weak point, so plan around it:
- Let FreeLLMAPI's auto routing do failover, but in its dashboard put the **largest-context, best-at-coding, tool-calling-capable** models first (Google Gemini models and the biggest coder models on OpenRouter are the usual candidates; check the model catalog/limits at freellmapi.co/models, they change often).
- **Groq**: very fast, but its free per-minute token limits are small. Agent loops send big prompts, so you will see 413/429 errors. Use it for tiny jobs or leave it as last fallback.
- **Cohere**: fine as a fallback; tool calling is typically its weakest area, so don't rely on it for main coding.
- Models without reliable tool/function calling will "describe" edits instead of making them. If the agent keeps pasting code instead of editing files, switch model.
- If a task goes in circles: `/new`, run `/resume`, retry the same `/build x.y`. Don't argue with a confused session.
- Check the model with vision (Gemini) when you want it to look at screenshots (see Playwright below).

## 3. MCP servers
Every enabled MCP adds tool descriptions to every request, which eats context on small models. So keep it minimal:

| MCP | Enable? | Why |
|---|---|---|
| **context7** (remote, no setup) | Always | Current docs for Next.js, Prisma, Better Auth, shadcn. This single tool prevents most hallucinated, outdated code. A free API key from context7.com raises rate limits (optional; add it as a header in `opencode.json` if you hit limits). |
| **shadcn** | Always | Lets the agent browse/install the right components instead of inventing them. |
| **playwright** | Only for UI check sessions (set `"enabled": false` to `true`) | Lets the agent open `localhost:3000`, click through flows and take screenshots. Needs a vision-capable model and downloads a browser on first use. Turn it off again afterwards. |
| Neon MCP | **Skip** | It can run SQL on your database with an AI that is not reliable. Use Prisma + `db:push` only. |
| GitHub MCP | Skip | Plain `git` is enough. |

On Windows the kit launches local MCP servers through `cmd /c npx`, which avoids the common "npx not found" failure. If an MCP shows as failed in opencode, run its command by hand in PowerShell once to see the real error.

## 4. Skills
The three skills in `.opencode/skills` are project-specific and load only when needed, which saves context. Don't install big generic skill packs on a free model: they cost context and push it into long "process" rituals. If you want one extra thing, add a code-review habit instead: run `/verify` at the end of every phase.

## 5. WebSockets / realtime
Not needed, and don't enable anything for it. Vercel's serverless functions can't hold WebSocket connections, and the store doesn't need live push: admin sees new orders when the dashboard loads or refreshes. (If you ever want live order alerts, use simple polling or a free hosted realtime service, later.)

## 6. The working loop
1. `opencode` in the project folder. First run: `/build 1.1`.
2. Read its report. Test the "Acceptance" line yourself (`npm run dev`, open the browser).
3. If it works: next task, in a fresh session (`/new`), e.g. `/build 1.2`. If not: tell it the exact error text (copy from terminal/browser) in the same session.
4. End of each phase: `/verify` (typecheck + lint + build + rule review).
5. Things only you can do: fill `.env`, run `npm run db:push` and `npm run db:seed` (tasks 1.3/1.4/2.1), create OAuth apps, upload real logo/images later.
6. Git is your undo button: every task is a commit. `git log --oneline` to see them; `git reset --hard <hash>` (run it yourself; the agent has to ask permission first) to go back.

Suggested pace: phases 1-2 in the first sitting, then one phase per sitting. Free-tier daily limits will pause you; progress is safe in PROGRESS.md and git.

## 7. Realistic expectations
- Nothing guarantees "flawless" from free models. What gets you close: small tasks, live docs (context7), the build/lint/typecheck gate on every task, and you testing each acceptance line.
- Phase 7.2 (product form with image upload and variant matrix) and phase 8 (bulk prices) are the hardest. If a model struggles, split the task yourself (for example: "only the variant matrix", then "only image upload") and run it again.
- Vercel's free Hobby plan is for non-commercial use. Fine for building and testing; when real sales start, plan to move to Pro or another host.
- The earlier session's Prisma issue (engine download blocked) was specific to that sandbox; on your PC `prisma generate` should work normally.
