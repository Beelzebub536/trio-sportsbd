# Trio Sports BD

E-commerce store for sports jerseys, trousers and accessories in Bangladesh.
Adidas-inspired storefront, cash on delivery with a small advance payment, and a
full admin panel including a bulk price manager.

- **Stack:** Next.js 14 (App Router, TypeScript strict), Tailwind CSS, shadcn/ui,
  lucide-react, Better Auth, Prisma + Neon Postgres, Zustand, Zod, Cloudinary.
- **Money:** whole taka only, formatted as `৳1,250`.
- **Not in this project:** email sending, online payment gateway, websockets,
  Redux, NextAuth, Supabase, any paid service.

> `README-SETUP.md` is the original kit manual (how the AI-assisted build was set
> up). This file is the app itself.

---

## 1. Requirements

- Windows 11 (or macOS/Linux), PowerShell
- Node.js 22 LTS and npm
- A free [Neon](https://neon.tech) Postgres database
- Optional: Cloudinary account (image uploads), Google/Facebook OAuth apps

## 2. Setup

```powershell
npm install

# 1. Create your env file and fill it in (never commit .env)
Copy-Item .env.example .env

# 2. Create the tables
npm run db:push

# 3. Seed categories, products and the admin account
npm run db:seed

# 4. Run it
npm run dev
```

Open http://localhost:3000. Admin panel: http://localhost:3000/admin
(sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`).

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon **pooled** connection string |
| `DIRECT_URL` | yes | Neon **direct** connection string |
| `BETTER_AUTH_SECRET` | yes | 32+ random chars |
| `BETTER_AUTH_URL` | yes | e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | yes | public base URL, no trailing slash |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes for seeding | creates/promotes the admin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | enables "Continue with Google" |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | no | enables "Continue with Facebook" |
| `CLOUDINARY_*` | no | without it, paste image URLs instead of uploading |
| `WHATSAPP_NUMBER` | no | fallback for the sign-in help link |

Generate the auth secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on http://localhost:3000 |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint (next lint) |
| `npm run tsc` | TypeScript, no emit |
| `npm run db:push` | push `prisma/schema.prisma` to the database |
| `npm run db:seed` | seed data + admin account (safe to re-run) |
| `npm run db:studio` | Prisma Studio |

## 4. Routes

**Storefront**

| Route | Purpose |
|---|---|
| `/` | home: hero banners, categories, new arrivals, sale strip |
| `/shop` | all products with filters, sort and pagination |
| `/men`, `/women`, `/kids` | filtered by gender |
| `/jerseys`, `/trousers`, `/accessories` | filtered by category |
| `/sale` | discounted products only |
| `/search` | keyword search |
| `/product/[slug]` | gallery, colour/size picker, stock, related items |
| `/cart` | cart with live prices and stock |
| `/checkout` | address, delivery, advance payment (bKash/Nagad) |
| `/order/[orderNumber]` | order confirmation (owner session or signed token) |
| `/track` | guest order tracking by order number + phone |
| `/login`, `/signup` | email + password, Google, Facebook |
| `/account` | orders, addresses, wishlist, profile |
| `/about`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`, `/size-guide`, `/data-deletion` | static pages |

**Admin** (`/admin`, admin role only)

| Route | Purpose |
|---|---|
| `/admin` | dashboard: counts, revenue, recent orders, low stock |
| `/admin/products` | search, active toggle, edit, delete |
| `/admin/products/new`, `/admin/products/[id]` | product form with image upload and variant matrix |
| `/admin/categories` | category CRUD (parent/child, sort order) |
| `/admin/banners` | home hero banners |
| `/admin/orders`, `/admin/orders/[id]` | order queue, status, advance verification, notes |
| `/admin/customers` | roles, order counts, delete |
| `/admin/prices` | spreadsheet price editor + bulk operations + CSV |
| `/admin/prices/history` | batches with one-click undo |
| `/admin/settings` | store name, numbers, advance %, delivery fees |

## 5. Common changes

**Store WhatsApp number, advance %, delivery fees** → `/admin/settings`.
Saving revalidates the storefront immediately.

**Logo** → `src/components/brand/Logo.tsx` (a placeholder component).

**Admin password** → sign in and change it from `/account/profile`, or set a new
`ADMIN_PASSWORD` and re-run `npm run db:seed` (seeding never resets an existing
password — use the profile page for that).

**Product images** → `/admin/products/[id]`: upload to Cloudinary or paste URLs.

**Bulk price changes** → `/admin/prices`: filter, select, apply an operation,
review the old → new preview, then save. Every save is a batch you can undo from
`/admin/prices/history`.

## 6. Business rules (short version)

- Prices are whole taka. A sale price must be **below** the base price.
- Effective price = sale price when set, otherwise the base price.
- Checkout is open to guests. The server always recomputes prices, delivery and
  stock from the database — client values are never trusted.
- Advance payment = `ceil(total × advancePercent / 100)`, paid by bKash or Nagad
  with a TrxID that an admin verifies. The balance is collected on delivery.
- Cancelling an order restocks its items.
- Order statuses: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED, plus
  CANCELLED and RETURNED.

## 7. Deploying

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the step-by-step Vercel guide,
OAuth setup, Cloudinary setup and the post-deploy checklist.
