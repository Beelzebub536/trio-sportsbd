# Progress log (agent keeps this updated)

Current phase: 1
Last commit: phase 2: session helpers + route guards

## Phases
- [x] 1 Foundation (scaffold, schema, seed)
- [ ] 2 Auth (Better Auth, roles, guards)
- [ ] 3 Layout + Home
- [ ] 4 Shop + Product page
- [ ] 5 Cart + Checkout + Orders (guest, 10% advance, WhatsApp)
- [ ] 6 Customer account
- [ ] 7 Admin panel (products, categories, orders, customers, settings)
- [ ] 8 Bulk price manager
- [ ] 9 Polish, SEO, legal pages, deploy docs
- [ ] 10 (later) SSLCommerz

## Notes / decisions
- Completed 1.1 Scaffold: Next.js app with Tailwind, shadcn/ui, etc.
- Completed 1.2 Env, utils, fonts, tokens
- Completed 1.3 Database schema (Prisma 5.22, app models + enums, `src/lib/prisma.ts` singleton, npm scripts). `prisma validate` and `prisma generate` pass. DB commands NOT run (no real DATABASE_URL).
- Completed 1.4 Seed script: `prisma/seed.ts` (idempotent upserts; replaces product images per run; deterministic stock) + `prisma/seed-data.ts` (11 categories, 24 products, 208 variants, 10 settings, 3 banners) + `src/lib/bd-locations.ts` (8 divisions, 64 districts). Admin creation left as a TODO hook for 2.4. Added `prisma/**/*.ts` to tsconfig so the seed is typechecked.
- PENDING (human): fill `.env` (DATABASE_URL, DIRECT_URL at minimum) and run `npm run db:push` then `npm run db:seed` to verify the seed in Prisma Studio. Seed was not run here because `.env` has no DATABASE_URL.
- Completed 2.1 Better Auth: upgraded `better-auth` 0.2.11 -> 1.7.10 (0.2.x has NO admin plugin). Added `src/lib/auth.ts` (Prisma adapter, email+password with no email sending, conditional Google/Facebook, admin plugin `adminRoles: ["admin"]` + `defaultRole: "customer"`, Google-only account linking, `nextCookies()` last), `src/app/api/auth/[...all]/route.ts`, `src/lib/auth-client.ts` (adminClient). Auth tables (User/Session/Account/Verification) generated with `npx @better-auth/cli generate` and merged into `schema.prisma` (all app models kept).
- tsconfig: removed `declaration`/`outDir` (they forced declaration emit and broke on Better Auth's nested zod types). `prisma validate`, `tsc`, `lint`, `build` all pass.
- Completed 2.2 Session helpers + route guards: `src/lib/session.ts` (`getSession`, `requireUser` -> `/login?next=`, `requireAdmin` -> `/` for non-admins), `src/middleware.ts` (Next 14 file name; optimistic `getSessionCookie` guard on `/admin/*` and `/account/*`, forwards `x-pathname`), placeholder `/admin` and `/account` pages using the helpers. `tsc`, `lint`, `build` pass.
- Between tasks: if the repo looks inconsistent (ignored core files, missing commits), check `.gitignore` and `docs/PROGRESS.md` first.
-

## Known issues
- Build prints a benign warning: `better-auth/cookies` pulls `jose` into the Edge (middleware) bundle and jose references `CompressionStream`. `getSessionCookie` does not use it at runtime (cookie sessions, not JWT), so the build passes and middleware works. Revisit if middleware ever runs JWT-based sessions.
