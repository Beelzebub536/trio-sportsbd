# Deploying Trio Sports BD

Everything here uses free tiers: Neon (database), Cloudinary (images),
Vercel Hobby (hosting), Google + Facebook OAuth (logins).

> Vercel's Hobby plan is for non-commercial use. Fine for building and testing;
> move to Pro (or another host) before you take real sales.

---

## 0. Order of operations

1. Neon database → get `DATABASE_URL` + `DIRECT_URL`
2. Generate `BETTER_AUTH_SECRET`
3. Push the repo to GitHub
4. Import it in Vercel → set env vars → deploy
5. Run `npm run db:push` and `npm run db:seed` against the production database
6. Set up OAuth apps with the **production** redirect URIs
7. Cloudinary (optional)
8. Post-deploy checklist

---

## 1. Neon Postgres

1. Sign up at https://neon.tech and create a project (pick the region closest to
   your customers — Singapore is a good choice for Bangladesh).
2. Open **Connection Details** and copy both strings:
   - **Pooled connection** → `DATABASE_URL` (the app uses this)
   - **Direct connection** → `DIRECT_URL` (Prisma uses this for `db push`)
3. Keep `?sslmode=require` on both.

## 2. Auth secret

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the output as `BETTER_AUTH_SECRET` (local **and** production — rotating it
signs everyone out and invalidates existing order-tracking links).

## 3. Push to GitHub

```powershell
git add -A
git commit -m "deploy"
git remote add origin https://github.com/<you>/trio-sportsbd.git
git push -u origin main
```

`.env` is git-ignored — confirm it never appears in the commit.

## 4. Vercel

1. https://vercel.com → **Add New… → Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave the build command and
   output directory at their defaults.
3. Under **Environment Variables**, add these for Production (and Preview):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled string |
   | `DIRECT_URL` | Neon direct string |
   | `BETTER_AUTH_SECRET` | from step 2 |
   | `BETTER_AUTH_URL` | `https://<your-domain>` |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` |
   | `ADMIN_EMAIL` | your admin email |
   | `ADMIN_PASSWORD` | a strong password (used only when seeding) |
   | `CRON_SECRET` | a random secret of at least 16 characters (protects pending-order expiry) |
   | `CLOUDINARY_CLOUD_NAME` | optional |
   | `CLOUDINARY_API_KEY` | optional |
   | `CLOUDINARY_API_SECRET` | optional |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional |
   | `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | optional |

   No trailing slash on the URLs. `NEXT_PUBLIC_*` values are baked in at build
   time — if you change one, redeploy.

4. **Deploy**. Then add your custom domain under **Settings → Domains** and
   update `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL` to match it, then redeploy.

## 5. Create the tables and seed

Run these locally, pointed at the production database (the safest way — no
shell access needed on Vercel):

```powershell
# temporarily point .env at the production database
npm run db:push
npm run db:seed
```

`db:push` creates/updates the tables. `db:seed` is idempotent: it upserts
categories, products and settings, creates the admin from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` if missing, and promotes an existing account to admin. It never
resets an existing password.

> Never run `prisma migrate reset` or any force-reset against production.

Before applying schema changes, inspect existing orders for duplicate payment
references (same payment method and TrxID). This release adds a unique constraint
for those pairs, so `npm run db:push` will fail if duplicate claims already exist.
The Vercel cron expires stale pending requests daily; this includes unverified
online orders (and releases their stock) and unconfirmed COD requests. Rejected
online claims are cancelled and their stock is released immediately. On Hobby,
the scheduled time is approximate. Checkout and order/admin pages also clean up
overdue requests when used, so stock release does not depend only on the cron.

## 6. Google OAuth

1. https://console.cloud.google.com → create a project.
2. **APIs & Services → OAuth consent screen**: External, app name, support email,
   developer email. Add the `.../auth/userinfo.email` and
   `.../auth/userinfo.profile` scopes. While the app is in "Testing", add your
   own Google account as a test user.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorised redirect URIs** — add both:

   ```
   http://localhost:3000/api/auth/callback/google
   https://<your-domain>/api/auth/callback/google
   ```

5. **Authorised JavaScript origins**:

   ```
   http://localhost:3000
   https://<your-domain>
   ```

6. Copy the client ID and secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   (locally in `.env`, and in Vercel). The "Continue with Google" button only
   appears when both are set.

## 7. Facebook login

1. https://developers.facebook.com → **Create App → Consumer**.
2. Add the **Facebook Login** product → **Settings**.
3. **Valid OAuth Redirect URIs**:

   ```
   http://localhost:3000/api/auth/callback/facebook
   https://<your-domain>/api/auth/callback/facebook
   ```

4. **Settings → Basic**: add an app icon, a **Privacy Policy URL**
   (`https://<your-domain>/privacy`) and a **User Data Deletion** URL
   (`https://<your-domain>/data-deletion`). Facebook will not switch the app to
   Live without these.
5. Copy **App ID** / **App Secret** into `FACEBOOK_CLIENT_ID` /
   `FACEBOOK_CLIENT_SECRET`.
6. Toggle the app from **Development** to **Live** at the top of the dashboard.

## 8. Cloudinary (optional)

1. Sign up at https://cloudinary.com (free tier).
2. Copy **Cloud name**, **API Key** and **API Secret** from the dashboard into
   the three `CLOUDINARY_*` variables.
3. Uploads go to the `trio-sportsbd/products` folder. The server signs each
   upload (`/api/upload/sign`, admin-only) and pins allowed formats
   (jpg/jpeg/png/webp) and a 5 MB maximum size.

Without Cloudinary, the product form still works: paste image URLs instead. Add
any new hostname to `images.remotePatterns` in `next.config.mjs`.

## 9. Post-deploy checklist

- [ ] Home page loads with banners, categories and products
- [ ] `/shop` filters, sorts and paginates
- [ ] A product page shows the right price, stock and colour/size picker
- [ ] Add to bag → `/cart` → `/checkout` places a test order
- [ ] The order confirmation page opens, and "Confirm on WhatsApp" pre-fills the
      message
- [ ] `/track` finds that order with the order number + phone
- [ ] Sign in works (email/password, then Google and Facebook if configured)
- [ ] `/account` shows the order, addresses and wishlist
- [ ] `/admin` loads for the admin account and is blocked for a customer
- [ ] `/admin/settings` → change the WhatsApp number → the storefront updates
- [ ] Keep online payments off until an approved business payment account is ready; then test advance and full-payment verification
- [ ] `/admin/prices` → change one price → review → save → the shop updates
- [ ] `/admin/prices/history` → undo that batch → the price reverts
- [ ] `/sitemap.xml` and `/robots.txt` respond
- [ ] `https://<your-domain>/admin` is not indexable

## 10. Changing things after launch

| Task | How |
|---|---|
| WhatsApp number, online-payment toggle, advance %, delivery fees | `/admin/settings` |
| Admin password | sign in → `/account/profile` → Change password |
| Logo | replace `src/components/brand/Logo.tsx` and redeploy |
| Prices in bulk | `/admin/prices` (undo any batch from `/admin/prices/history`) |
| Products, images, stock | `/admin/products` |
| Home banners | `/admin/banners` |
| Categories and menu | `/admin/categories` |

## 11. Troubleshooting

- **Build fails with a database error** — a page that touches the database is
  being prerendered. Storefront and admin layouts are marked
  `force-dynamic`; keep that on any new page that queries Prisma.
- **Sign-in redirects to the wrong host** — `BETTER_AUTH_URL` and
  `NEXT_PUBLIC_APP_URL` must match the domain you are actually using, with no
  trailing slash. Redeploy after changing them.
- **OAuth error `redirect_uri_mismatch`** — the callback URI in the Google or
  Facebook console must match exactly, including `http` vs `https`.
- **Images from a new host don't render** — add the hostname to
  `images.remotePatterns` in `next.config.mjs`.
- **Uploads return "Cloudinary is not configured"** — the three `CLOUDINARY_*`
  variables are missing on the server; paste image URLs instead.
