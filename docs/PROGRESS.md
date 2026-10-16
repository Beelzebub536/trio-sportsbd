# Progress log (agent keeps this updated)

Current phase: 9 (all phases 1–9 implemented; runtime verification pending a filled `.env`)
Last commit: phase 6-8: customer account, admin panel, bulk price manager

## Phases
- [x] 1 Foundation (scaffold, schema, seed)
- [x] 2 Auth (Better Auth, roles, guards)
- [x] 3 Layout + Home
- [x] 4 Shop + Product page
- [x] 5 Cart + Checkout + Orders (guest, 10% advance, WhatsApp)
- [x] 6 Customer account
- [x] 7 Admin panel (products, categories, orders, customers, settings)
- [x] 8 Bulk price manager
- [x] 9 Polish, SEO, legal pages, deploy docs
- [ ] 10 (later) SSLCommerz

## Notes / decisions
- Completed 1.1 Scaffold: Next.js app with Tailwind, shadcn/ui, etc.
- Completed 1.2 Env, utils, fonts, tokens
- Completed 1.3 Database schema (Prisma 5.22, app models + enums, `src/lib/prisma.ts` singleton, npm scripts). `prisma validate` and `prisma generate` pass.
- Completed 1.4 Seed script: `prisma/seed.ts` (idempotent upserts; replaces product images per run; deterministic stock) + `prisma/seed-data.ts` (11 categories, 24 products, 208 variants, 10 settings, 3 banners) + `src/lib/bd-locations.ts` (8 divisions, 64 districts). Added `prisma/**/*.ts` to tsconfig so the seed is typechecked.
- Completed 2.1 Better Auth: `better-auth` 1.7.10 (0.2.x has NO admin plugin). `src/lib/auth.ts` (Prisma adapter, email+password with no email sending, conditional Google/Facebook, admin plugin, `nextCookies()` last), `src/app/api/auth/[...all]/route.ts`, `src/lib/auth-client.ts`. Auth tables generated with the Better Auth CLI and merged into `schema.prisma`.
- tsconfig: removed `declaration`/`outDir` (they forced declaration emit and broke on Better Auth's nested zod types).
- Completed 2.2 Session helpers + route guards: `src/lib/session.ts` (`getSession`, `requireUser` -> `/login?next=`, `requireAdmin` -> `/` for non-admins), `src/middleware.ts` (optimistic `getSessionCookie` guard on `/admin/*` and `/account/*`, forwards `x-pathname`).
- Completed 2.3 Login + signup: route groups `(store)` and `(auth)`; `LoginForm`/`SignupForm` (RHF + Zod), `SocialButtons` renders Google/Facebook only when their env keys exist. Validators in `src/lib/validators/auth.ts`, `safeNext` in `src/lib/auth-helpers.ts`.
- Completed 2.4 Admin seed: `prisma/seed.ts` builds a standalone `betterAuth` instance (prisma adapter + admin plugin, no `nextCookies`), calls `seedAuth.api.signUpEmail`, then promotes the user to `admin`. Idempotent: promotes an existing account and never resets its password. Skips when `ADMIN_EMAIL`/`ADMIN_PASSWORD` are unset.
- Completed 3.1–3.3 Storefront shell: `AnnouncementBar`, `SiteHeader` (CSS-only mega menu via `group-hover`/`group-focus-within`), `MobileMenu`, `AccountMenu`, `SearchOverlay`, `CartSheet`, `Footer`. Home page: `HeroCarousel` (first banner `priority`), `CategoryTiles`, `ProductRow`, `SaleStrip`, `BrandStory`, `WhatsAppCta`. `StaticPage` wrapper + `/about`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`, `/data-deletion`, `/size-guide`; `NotFoundContent` + root and `(store)` `not-found.tsx`; root `error.tsx`.
- `(store)/layout.tsx` sets `export const dynamic = "force-dynamic"` so `next build` never queries the database (a build with an empty `.env` still succeeds). Keep this on any new page that queries Prisma.
- Completed Phase 4: `src/lib/queries/products.ts` (`getListing`, `getFacets`, `getNewArrivals`, `getFeaturedProducts`, `getSaleProducts`, `searchProductCards`, `getProductBySlug`, `getRelatedProducts`, `getProductsByIds`), `ProductCard`/`ProductGrid`/`Pagination`/`FilterPanel`/`ListingToolbar`/`ProductListing`, `src/lib/listing-params.ts`, routes `/shop`, `/men`, `/women`, `/kids`, `/jerseys`, `/trousers`, `/accessories`, `/sale`, `/search`, `/api/search`, and `/product/[slug]` with `ProductGallery`, `ProductDetail`, JSON-LD and related products.
- Listing strategy: the database filters, then JS sorts and paginates (`getListing`) so sorting by effective/sale price and discount is exact. Price filters also apply to the effective price. Category parent/child is resolved in JS via `parentId` (`resolveCategoryIds`) because `Category` has no self-relation.
- Completed Phase 5: `src/lib/order-token.ts` (HMAC-signed link for guest order pages), `src/lib/whatsapp.ts`, `src/lib/validators/order.ts`, `src/actions/cart.ts` (`getCartDetails`), `src/actions/order.ts` (`placeOrder`: stock-checked transaction, server-side prices/delivery, 10% advance, in-memory rate limit 5/hour/phone), `src/actions/track.ts`, `CartView`, `OrderSummary`, `CheckoutForm`, `OrderStatusBadge`, `OrderTimeline`, `TrackForm`, and `/cart`, `/checkout`, `/order/[orderNumber]`, `/track`.
- Completed Phase 6: `requireUserId`/`requireAdminUser` added to `src/lib/session.ts`; `src/actions/address.ts`, `src/actions/profile.ts`, `src/lib/validators/address.ts`; `(store)/account` layout + orders, order detail, addresses, wishlist, profile pages; `AddressManager`, `ProfileForm`, `PasswordForm`, `WishlistSync`. `/account` moved into the `(store)` group so it gets the store header/footer. Guests keep a localStorage wishlist (`trio-wishlist`); signing in merges it into the database (`mergeWishlistAction`).
- `src/lib/validators/address.ts` exists because a `"use server"` module may only export async functions — keep Zod schemas out of `src/actions/*`.
- Completed Phase 7: `src/app/admin/layout.tsx` (sidebar + `requireAdmin`), dashboard (counts, revenue excluding cancelled, recent orders, low stock ≤ 5), products list/new/edit, `ProductForm` + `ProductImages` + `VariantMatrix`, categories, banners, orders list/detail with status + advance verification + balance collected + internal note, customers (role change, delete), settings. Server actions in `src/actions/admin/*` each call `requireAdminUser()` again. `src/app/api/upload/sign/route.ts` signs Cloudinary uploads (admin-only, pins folder, formats and a 5 MB cap) and returns a 503 when Cloudinary is not configured — the form then falls back to pasting image URLs.
- Product saves replace images and variants wholesale inside one transaction (order items keep their own name/size/colour/price snapshots, so history is unaffected). Deleting a product first removes its wishlist rows, price changes, images and variants.
- Completed Phase 8: `src/lib/prices.ts` (pure price maths + `buildDiff`), `src/lib/csv.ts` (dependency-free CSV reader/writer for slug/sku + prices), `src/lib/validators/prices.ts`, `src/actions/admin/prices.ts` (`savePriceBatch` writes one `PriceBatch` + `PriceChange` rows in a transaction; `undoBatch` restores old values and skips products touched by a newer batch), `/admin/prices` (filter, multi-select, inline edit, bulk operations with a mandatory preview, sticky unsaved-changes bar, CSV import/export) and `/admin/prices/history` (view changes, one-click undo).
- CSV uses a small hand-written parser instead of papaparse: `papaparse` ships without types and adding `@types/papaparse` would add a dependency. The price sheet is only `slug`/`sku` + two numbers, so this is simpler and fully validated per row.
- Completed Phase 9: `src/lib/seo.ts` (`buildMetadata`, `siteUrl`), `src/app/sitemap.ts` (static routes + categories + products), `src/app/robots.ts` (blocks admin/api/account/cart/checkout/order/track/login), canonical URLs on all listing pages + product pages, OG/Twitter defaults on the root layout with `metadataBase`, `noindex` on search and admin, security headers in `next.config.js` (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, `X-Robots-Tag: noindex` for `/admin`), `poweredByHeader: false`, `ListingSkeleton` + `loading.tsx` for every listing route, the product page and admin, and `prefers-reduced-motion` handling in `globals.css`.
- Docs: `README.md` (setup, scripts, routes, common changes, business rules) and `docs/DEPLOY.md` (Vercel, Neon, Google + Facebook OAuth with exact redirect URIs, Cloudinary, post-deploy checklist, troubleshooting). `.env.example` cleaned of the leftover Stripe variables; `src/lib/env.ts` no longer mentions Stripe.
- `formatBDT` returns `৳1,250` (whole taka, `en-IN` grouping). `effectivePrice` and `discountPercent` live beside it in `src/lib/format.ts`.
- `src/lib/settings.ts` exposes `getSettings()` (cached, tagged `store-settings`) which swallows database errors and returns defaults, so the storefront renders before the database is reachable.

## PENDING (human)
- Fill `.env` (`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) and run `npm run db:push` then `npm run db:seed`.
- Then walk the post-deploy checklist in `docs/DEPLOY.md` §9 against `npm run dev`. No database command, auth flow or checkout has been executed yet — verification so far is typecheck + lint + build only.

## Known issues
- Build prints a benign warning: `better-auth/cookies` pulls `jose` into the Edge (middleware) bundle and jose references `CompressionStream`. `getSessionCookie` does not use it at runtime (cookie sessions, not JWT), so the build passes and middleware works. Revisit if middleware ever runs JWT-based sessions.
- Build also warns that `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` are missing while `.env` is empty. It is non-blocking and disappears once `.env` is filled.
- `ProductVariant.sku` is globally unique. The admin form auto-generates `SLUG-COLOUR-SIZE`, so collisions are unlikely, but two products cannot share a manually entered SKU.
- Re-saving a product recreates its variants, which nulls `OrderItem.variantId` on historical orders (the order keeps its own name/size/colour/price snapshot, so nothing is lost visually).
- Rate limiting for `placeOrder` is in-memory, so it resets on redeploy and is per-instance on serverless. Fine for now; move to the database if spam becomes a problem.
