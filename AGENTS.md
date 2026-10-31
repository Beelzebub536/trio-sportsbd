# trio-sportsbd - agent rules

E-commerce site for sports jerseys, trousers and accessories (Bangladesh). Dark "night match" UI (rules in the `adidas-ui` skill). Free-tier only, deployed on Vercel.

## Start of every session (mandatory)
1. Read `docs/PROGRESS.md` (what is done, what is next, known issues).
2. Read ONLY the section of `docs/PLAN.md` / `docs/PROMPTS.md` relevant to the current task.
3. Load the skills you need: `stack-gotchas` (always), `adidas-ui` (any UI work; now describes the dark night-match design), `orders-and-pricing` (cart, checkout, orders, admin prices).

## Environment
- Windows 11, PowerShell, Node 22 LTS, npm. Never use bash-only commands (`rm -rf`, `cp`, `export`, `&&` chains that assume bash). Use npm scripts or small Node scripts for anything file-related.
- Project root is this folder. App code is in `src/`.

## Stack (fixed, do not substitute)
Next.js (latest stable, App Router, TypeScript strict) / Tailwind CSS / shadcn/ui / lucide-react / Better Auth (Google, Facebook, email+password; roles `admin`, `customer`) / Prisma + Neon Postgres / Zustand (cart, localStorage) / Zod + React Hook Form / Cloudinary (images). Currency: BDT, whole-taka integers. Language: English only.
NOT in this project: email sending, Resend, Stripe, websockets, Redux, NextAuth, Supabase, any paid service.

## How to work
- ONE task at a time. Finish it, verify it, then stop and report. Do not start the next task unasked.
- Never guess an API. For Next.js, Prisma, Better Auth, shadcn and Tailwind, check the docs with the `context7` tool (or fetch the official docs) for the version in `package.json`. Training-data memory of these libraries is often outdated.
- Do not add a dependency that is not listed in `docs/PLAN.md` section 2 without asking.
- After every task run, in order: `npx tsc --noEmit`, `npm run lint`, and `npm run build` (build at least at the end of each phase). Fix every error. Never say "done" while any of them fails.
- After every task: update `docs/PROGRESS.md` (tick items, add a one-line note, list problems) and run `git add -A; git commit -m "<phase>: <what>"`.
- If a command fails twice with the same error, stop and report the exact error. Do not loop.
- Do not run destructive DB commands (migrate reset, force-reset, drop). Never edit `.env`; only edit `.env.example`.
- Never put secrets in code or commit `.env`.

## Code conventions
- Files under ~250 lines. Split components. One component per file, PascalCase; folders kebab-case.
- Server components by default; `"use client"` only for interactivity.
- Mutations are server actions in `src/actions/*.ts`. Each one: validate with Zod, check auth (`requireUser()` / `requireAdmin()` from `src/lib/session.ts`), then act. Admin checks happen on the server in every admin action and page. Hiding UI is not security.
- Never trust prices, totals or stock from the client. Recompute from the database.
- All DB access through `src/lib/prisma.ts`. Money is `Int` taka. Format with `formatBDT()` from `src/lib/format.ts` (`৳1,250`).
- Accessible by default: labels, alt text, focus states, keyboard navigation. Mobile first.
- No lorem ipsum in final UI; use realistic sports-store copy. Logo is a placeholder component `src/components/brand/Logo.tsx` (easy to swap).

## Definition of done (every task)
Typecheck, lint and build pass; the feature works on `npm run dev`; PROGRESS.md updated; committed.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
