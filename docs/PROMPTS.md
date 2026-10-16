# Task list for opencode

Run one task at a time with `/build <phase.task>`, for example `/build 1.1`. Start a fresh session (`/new`) between tasks. Each task ends with: typecheck + lint pass, PROGRESS.md updated, git commit.
Everything is specified in `docs/PLAN.md`; skills hold the rules. Acceptance = how the human tests it.

---
## PHASE 1 - Foundation
Shared context: if the folder already contains a Next.js project from an earlier attempt, inspect it, keep what is good and fix the rest instead of starting over.

### 1.1 Scaffold
Create the Next.js app in the CURRENT folder (TypeScript, App Router, Tailwind, ESLint, `src/` dir, import alias `@/*`, npm). Keep AGENTS.md, opencode.json, docs/ and .opencode/ untouched. `git init` if needed, add a proper `.gitignore` (node_modules, .next, .env, .env.local). Initialise shadcn/ui (`npx shadcn@latest init`, base color neutral) and set `--radius: 0`. Add components: button, input, label, select, checkbox, radio-group, dialog, sheet, dropdown-menu, accordion, tabs, badge, skeleton, table, sonner, separator, scroll-area, popover, command, textarea, switch, card.
Acceptance: `npm run dev` shows the default page; `npm run build` passes.

### 1.2 Env, utils, fonts, tokens
Create `src/lib/env.ts` (Zod-validated env as in PLAN.md section 3; optional keys may be empty), `.env.example`, `src/lib/format.ts` (`formatBDT`, `discountPercent`), `src/lib/utils.ts`, `src/components/brand/Logo.tsx` (text placeholder "TRIO SPORTS BD" in bold condensed, easy to replace). Set up fonts (Barlow Condensed + Inter) with `next/font/google` and the color tokens from the `adidas-ui` skill in `globals.css`. Set `<title>`/metadata defaults for trio-sportsbd.
Acceptance: home page shows the Logo in the right fonts; missing required env gives a clear error.

### 1.3 Database schema
Install Prisma (check the installed major version's requirements first: config file, generator output, driver adapter). Write `prisma/schema.prisma` with the app models from PLAN.md section 4. Leave a clearly marked place for the Better Auth tables (added in 2.1). Create `src/lib/prisma.ts` singleton. Add npm scripts: `postinstall` (prisma generate), `db:push`, `db:seed`, `db:studio`. Do NOT run anything against the database unless `.env` exists with DATABASE_URL; if it does not, stop and tell me exactly what to fill in.
Acceptance: `npx prisma validate` passes; `npx prisma generate` passes.

### 1.4 Seed script
Write `prisma/seed.ts` per PLAN.md section 7 (idempotent: use upserts, safe to re-run). Admin creation is added in 2.4, leave a TODO hook. Add `src/lib/bd-locations.ts` (8 divisions with their districts).
Acceptance: after I run `npm run db:push` and `npm run db:seed`, Prisma Studio shows categories, 24 products with variants/images, settings, banners.

---
## PHASE 2 - Authentication and roles
Shared context: read the Better Auth section of the `stack-gotchas` skill and the official docs via context7 before writing anything.

### 2.1 Better Auth server + tables
Install better-auth. Create `src/lib/auth.ts` (Prisma adapter, email+password with NO email sending, Google and Facebook enabled only if their env keys exist, admin plugin with roles admin/customer and default role customer, Google account linking only, `nextCookies()` last). Generate the auth tables with the Better Auth CLI and merge them into schema.prisma (keep all app models). Create `src/app/api/auth/[...all]/route.ts` and `src/lib/auth-client.ts` (with adminClient plugin).
Acceptance: `npx prisma validate`, typecheck, lint pass. I run `npm run db:push` successfully.

### 2.2 Session helpers + route guards
Create `src/lib/session.ts`: `getSession()`, `requireUser()` (redirects to /login?next=...), `requireAdmin()` (redirects non-admins to /). Create the proxy file (name per installed Next version) that redirects signed-out visitors from `/admin/*` and `/account/*` to `/login?next=<path>`. Add a placeholder `/admin` page that calls `requireAdmin()` and prints "Admin area", and `/account` that calls `requireUser()`.
Acceptance: signed-out /admin -> /login; customer -> / ; admin sees the page.

### 2.3 Login and signup pages
Build `/login` and `/signup` in the Adidas style: split layout (big image/black panel on the left on desktop), email+password form (React Hook Form + Zod), "Continue with Google" and "Continue with Facebook" buttons (hidden or disabled with a tooltip when keys are missing), error toasts, `next` redirect param support, link between the two pages. Fields on signup: name, email, password (min 8), confirm password. Include a visible note on the login page: "Forgot your password? Message us on WhatsApp" linking to the settings WhatsApp number (placeholder fine).
Acceptance: I can sign up with email, sign out, sign in. Social buttons start the OAuth flow when keys exist.

### 2.4 Admin seed
In `prisma/seed.ts`, create the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` using Better Auth's own API/hashing (not a hand-rolled hash), role `admin`. Re-running must not duplicate or reset an existing admin. Confirm in code that a normal signup can never obtain `admin` (try to pass `role` in the signup payload and make sure it is ignored/blocked).
Acceptance: seed creates the admin; I can log in at /login and open /admin; a new signup opens /admin -> redirected away.

---
## PHASE 3 - Layout and home page
Shared context: load the `adidas-ui` skill. Use real data from the database where possible (categories, products, banners, settings).

### 3.1 Header, mega menu, footer
Build announcement bar, sticky header with mega menu (desktop) and slide-in menu (mobile), search input (opens a command-palette style overlay; wire real results in 4.4), wishlist/account/bag icons with counts (bag count from the cart store, create the Zustand store skeleton in `src/stores/cart.ts`), account dropdown (shows Login/Sign up or name + My orders + Admin (only if admin) + Sign out). Footer with link columns, WhatsApp contact (from settings), payment note ("Cash on delivery - 10% advance via bKash/Nagad"), social icons (placeholders).
Acceptance: looks right at 375/768/1280 px; menu keyboard-accessible.

### 3.2 Home page
Sections: full-width hero banner carousel from `Banner` table (simple CSS/scroll-snap, no heavy library), category tiles (Jerseys, Trousers, Accessories, Sale), "New arrivals" and "Best sellers" (use featured flag as proxy) as horizontal scroll rows of ProductCard, sale strip, brand story block, WhatsApp CTA block. Build the shared `ProductCard` component now (see adidas-ui skill) with skeleton version.
Acceptance: home loads fast with seeded data; cards link to /product/[slug] (404 page is fine until 4.3).

### 3.3 Static pages and 404
Create /about, /contact (WhatsApp-first, no form that sends email), /shipping-returns, /privacy, /terms, /data-deletion (explains how to request deletion via WhatsApp; required for Facebook login), /size-guide, plus a branded `not-found.tsx` and `error.tsx`. Write real, sensible copy for a Bangladesh sports store (delivery times, COD, advance, returns policy of 7 days for unused items with tags).
Acceptance: all pages render and are linked from the footer.

---
## PHASE 4 - Shop and product page

### 4.1 Listing page and queries
`/shop` and the shortcut routes (/men, /women, /kids, /jerseys, /trousers, /accessories, /sale) share one listing component. Server-side filtering via URL search params: category, gender, size, color, price range, brand, on-sale, sort (newest, price low-high, price high-low, discount), page. Put queries in `src/lib/queries/products.ts` using Prisma. Only active products. Show result count and "Load more" (or numbered pagination).
Acceptance: URL params change results; works without JavaScript for basic filtering (links/forms).

### 4.2 Filter UI
Desktop sidebar with accordions (category, gender, size, color swatches, price range slider/inputs, brand, on sale), mobile bottom-sheet, removable active-filter chips, "Clear all". Facet options (sizes, colors, brands) come from the database.
Acceptance: all filters work together on mobile and desktop.

### 4.3 Product detail page
`/product/[slug]`: gallery (thumbnails, swipe on mobile, hover/tap zoom), color swatches that switch images, size grid with out-of-stock states from variant stock, price block with discount badge, quantity, ADD TO BAG (adds to the Zustand cart and opens the drawer; wired fully in 5.1), wishlist heart, WhatsApp "Ask about this product" link, accordions, low-stock notice, "You may also like" (same category). JSON-LD Product schema and `generateMetadata`.
Acceptance: selecting a size/color updates stock state; invalid combos can't be added.

### 4.4 Search
Live suggestions overlay (debounced, server action or route handler, max 6 results with image and price) and `/search?q=` results page reusing the listing component.
Acceptance: typing "jersey" shows suggestions in under a second.

---
## PHASE 5 - Cart, checkout, orders
Shared context: load the `orders-and-pricing` skill and follow it exactly.

### 5.1 Cart store, drawer, cart page
Complete the Zustand cart (persisted, add/remove/update qty, clear, hydration-safe so there is no SSR mismatch). Cart drawer with free-shipping progress bar. `/cart` page. A server action `getCartDetails(items)` returns live price/stock for the lines; show notices for changed price or insufficient stock.
Acceptance: cart survives refresh; prices shown always come from the server.

### 5.2 Checkout form and order creation
`/checkout`: contact + address form (BD phone validation, division -> district select, upazila text), saved-address picker for logged-in users, order summary, shipping fee by region, advance box (percent from settings), bKash/Nagad choice with the store number, TrxID + sender number fields, terms checkbox. Server action `placeOrder` per the skill (transaction, stock decrement, order number, rate limit). Never trust client prices.
Acceptance: a guest can place an order; stock decreases; an order with insufficient stock is rejected with a clear message; tampering with prices in the browser has no effect.

### 5.3 Order success, WhatsApp, tracking
`/order/[orderNumber]` success page (shows only to the creator via a signed short-lived token in the URL or session; do not expose other people's orders by guessing numbers), summary, status timeline, "Confirm on WhatsApp" button with the pre-filled message. `/track` for guests (order number + phone). Clear the cart after success.
Acceptance: pre-filled WhatsApp message opens correctly with all order details; wrong phone on /track shows nothing.

---
## PHASE 6 - Customer account

### 6.1 Orders and order detail
`/account` dashboard (greeting, last order, quick links), `/account/orders` (list with status badges), `/account/orders/[id]` (items, totals, advance status, timeline, "Need help? WhatsApp us" link). Orders placed as guest with the same phone are NOT auto-attached; only orders with `userId`.
Acceptance: user sees only their own orders; another user's order id returns 404.

### 6.2 Addresses, wishlist, profile
Address book CRUD (default address), wishlist page and heart buttons wired to the DB for logged-in users (guests keep a local wishlist and it merges on login), profile page (name; change password via Better Auth; delete-account request via WhatsApp note).
Acceptance: all CRUD works; heart state persists across sessions.

---
## PHASE 7 - Admin panel
Shared context: every page calls `requireAdmin()`; every server action calls it again. Sidebar layout, breadcrumbs, responsive.

### 7.1 Admin layout + dashboard
Sidebar nav, top bar with admin name and "View store". Dashboard: cards (today's orders, pending advance verifications, revenue this month from verified/delivered orders, low-stock count), recent orders table, low-stock list (stock <= 5).
Acceptance: numbers match the database.

### 7.2 Product list + create/edit
Product table (search, filter by category/status, sort, pagination, active toggle, featured toggle, inline price edit as in the skill). Create/edit form: name, slug (auto), description, brand, gender, category, base/sale price, active/featured, images (multi-upload to Cloudinary through the signed-upload route, reorder, assign to a color, delete), variant matrix (pick sizes + colors, then set stock per combination; auto SKU). Server actions with Zod; revalidate storefront.
Acceptance: I can add a product with images and variants and see it live on /shop.

### 7.3 Categories and banners
Category CRUD (parent/child, image, sort order) and banner CRUD (image upload, link, order, active).
Acceptance: changes appear in the storefront menu/home.

### 7.4 Orders management
Orders table (filter by status/advance status/date, search by order number/phone/name), order detail (customer, address, items, totals), actions: verify or reject advance, change status, mark balance collected, add admin note, cancel (restocks). "Message on WhatsApp" button opens wa.me to the customer's phone with a template message per status.
Acceptance: full lifecycle works; cancel restores stock.

### 7.5 Customers and settings
Customers table (search, role, banned), set role admin/customer (cannot demote the last admin; cannot demote yourself), ban/unban, reset password for a customer (admin sets a new one). Settings page for all keys in the `orders-and-pricing` skill with validation; saving revalidates.
Acceptance: changing the WhatsApp number or advance percent immediately changes the storefront and checkout.

---
## PHASE 8 - Bulk price manager (`/admin/prices`)
Shared context: load the `orders-and-pricing` skill, section "Bulk price changes". This is the most important admin feature: make it fast and obvious.

### 8.1 Spreadsheet-style editor
A table of all products (thumbnail, name, category, base price, sale price, discount %), with filters (category, gender, brand, search, on-sale), multi-select with "select all matching filters", inline editing of base and sale price, a sticky "N unsaved changes - Review & Save" bar. Saving shows the preview diff first, then writes one PriceBatch in a transaction and revalidates the storefront.
Acceptance: I can change 20 prices in under a minute and see them live on the shop.

### 8.2 Bulk operations
Toolbar for the selected rows: set exact price, increase/decrease by %, increase/decrease by ৳, set sale price as X% off, remove sale, round to nearest 5/10/50. Always preview (old -> new, highlight problems) before Apply. Validation per the skill.
Acceptance: "increase all Jerseys by 10%, round to 10" works for the whole category with a correct preview.

### 8.3 History, undo, CSV
`/admin/prices/history`: list of batches (who, when, label, count, summary) with "Undo batch" (per skill rules) and "View changes". CSV export of current prices and CSV import with preview and validation errors per row.
Acceptance: undo restores exact previous prices; a bad CSV row is reported and nothing is applied until fixed.

---
## PHASE 9 - Polish and launch

### 9.1 SEO and performance
`sitemap.xml` (products, categories), `robots.txt`, canonical URLs, OpenGraph/Twitter metadata, product JSON-LD check, image sizes/`sizes` attributes, `loading`/`priority` on hero, dynamic imports for heavy client parts, check no layout shift. Fix anything found by `npm run build` warnings.

### 9.2 Accessibility and responsive pass
Walk through every page at 375/768/1280: focus order, labels, contrast, keyboard use of menus/drawers/dialogs, reduced motion, no horizontal scroll. Fix issues. Add skeletons/`loading.tsx` where slow.

### 9.3 Security pass
Check: every admin action/page guarded, input validation everywhere, order/track endpoints can't leak other people's data, rate limits, no secrets client-side, `next.config` security headers, upload route admin-only and type/size limited. Run `/verify`.

### 9.4 Docs for deployment
Write `README.md` (setup on Windows, env vars, Neon, db:push/seed) and `docs/DEPLOY.md`: step-by-step Vercel deploy, setting env vars, Google OAuth setup (console steps, redirect URIs for localhost and production), Facebook login setup (Meta app, valid OAuth redirect URI, privacy policy URL = /privacy, data deletion URL = /data-deletion, switch app to Live), Cloudinary setup, how to change the admin password, and how to swap the logo and WhatsApp number.

---
## PHASE 10 - Later: SSLCommerz
Not now. When asked: add SSLCommerz sandbox integration (initiate, IPN/validation route handler, success/fail/cancel pages), replace the manual bKash/Nagad advance step with the gateway for the advance (COD for the balance), keep the manual flow as a fallback setting, never mark an order paid from the redirect alone (only after server-side validation).
