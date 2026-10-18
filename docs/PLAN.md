# trio-sportsbd - master plan

## 1. Product
Online store "trio-sportsbd": sports jerseys, trousers and accessories for Bangladesh. Adidas-style, intuitive, mobile first. English only, currency BDT (৳). Logo is a placeholder. Communication happens on WhatsApp (placeholder number), there is NO email. Customers must create an account or sign in before checkout so their orders appear in their account history. Admin settings choose between COD order requests and online payment proof; when enabled, customers may submit full payment or the configured advance, and an admin verifies it before confirmation. WhatsApp is a customer-initiated handoff, not an automatic message sender. SSLCommerz remains a later phase. Admin can change many prices in a few clicks.

Roles: `customer` (default), `admin` (seeded only). Customers: browse, wishlist, cart, checkout, own orders, addresses, profile. Admin: everything in /admin.

## 2. Allowed dependencies
next, react, react-dom, typescript, tailwindcss (+ @tailwindcss/postcss if v4), shadcn/ui deps (class-variance-authority, clsx, tailwind-merge, tw-animate-css, radix-ui packages via shadcn), lucide-react, sonner, better-auth, prisma, @prisma/client (+ the driver adapter the installed Prisma version needs), zod, react-hook-form, @hookform/resolvers, zustand, @tanstack/react-table, cloudinary, next-cloudinary (optional), papaparse (CSV), date-fns, tsx (seed script), eslint + eslint-config-next. Anything else: ask first.

## 3. Environment variables (`.env.example`, validated in `src/lib/env.ts`)
```
DATABASE_URL=            # Neon pooled connection string
DIRECT_URL=              # Neon direct connection string
BETTER_AUTH_SECRET=      # 32+ random chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```
Google/Facebook/Cloudinary may be empty in dev: the matching feature hides itself or shows a clear "not configured" message instead of crashing.

## 4. Data model (application tables)
Better Auth tables (`user`, `session`, `account`, `verification`) come from the Better Auth CLI; the `user` table also carries `role` (default `customer`) and the admin plugin's ban fields. Add these app models to `schema.prisma` (names may follow the Prisma naming style in use):

```
enum Gender { MEN WOMEN KIDS UNISEX }
enum OrderStatus { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED RETURNED }
enum AdvanceStatus { PENDING VERIFIED REJECTED }
enum AdvanceMethod { BKASH NAGAD }   // later: SSLCOMMERZ
enum PaymentMethod { COD }           // later: ONLINE

model Category { id, name, slug @unique, parentId?, image?, sortOrder Int @default(0) } // self relation parent/children
model Product {
  id, name, slug @unique, description, brand?, gender Gender, categoryId,
  basePrice Int, salePrice Int?, isActive Boolean @default(true), isFeatured Boolean @default(false),
  createdAt, updatedAt   // relations: category, images, variants
  @@index([categoryId]) @@index([isActive, createdAt])
}
model ProductVariant { id, productId, size, color, colorHex?, sku @unique, stock Int @default(0)
  @@unique([productId, size, color]) }
model ProductImage { id, productId, url, publicId, color?, sortOrder Int @default(0) }
model Wishlist { id, userId, productId, createdAt  @@unique([userId, productId]) }
model Address { id, userId, fullName, phone, division, district, upazila, line1, isDefault Boolean @default(false) }
model Order {
  id, orderNumber @unique, userId?, customerName, phone, division, district, upazila, address, note?,
  subtotal Int, shippingFee Int, total Int, advanceAmount Int,
  paymentMethod PaymentMethod @default(COD),
  advanceMethod AdvanceMethod, advanceTrxId String, advanceSenderNumber String,
  advanceStatus AdvanceStatus @default(PENDING),
  balanceCollected Boolean @default(false),
  status OrderStatus @default(PENDING), adminNote?, createdAt, updatedAt
  @@index([phone]) @@index([status, createdAt])
}
model OrderItem { id, orderId, variantId?, productId?, name, size, color, image?, unitPrice Int, qty Int }
model PriceBatch { id, label, createdById, summary Json, createdAt, revertedAt? }
model PriceChange { id, batchId, productId, field String /* "BASE" | "SALE" */, oldValue Int?, newValue Int? }
model Setting { key String @id, value Json }
model Banner { id, title, subtitle?, imageUrl, linkUrl, sortOrder Int, isActive Boolean }
```
Money columns are `Int` (whole taka).

## 5. Routes
Storefront: `/` `/shop` `/shop/[...filters]` (or query params) `/men` `/women` `/kids` `/jerseys` `/trousers` `/accessories` `/sale` `/search` `/product/[slug]` `/cart` `/checkout` `/order/[orderNumber]` (success) `/track` `/wishlist`
Auth: `/login` `/signup`
Account (login required): `/account` `/account/orders` `/account/orders/[id]` `/account/addresses` `/account/profile`
Admin (admin only): `/admin` `/admin/products` `/admin/products/new` `/admin/products/[id]` `/admin/prices` (bulk manager) `/admin/categories` `/admin/orders` `/admin/orders/[id]` `/admin/customers` `/admin/banners` `/admin/settings`
Static: `/about` `/contact` `/shipping-returns` `/privacy` `/terms` `/data-deletion` `/size-guide`
API: `/api/auth/[...all]` `/api/upload/sign` (Cloudinary signed upload, admin only) `/sitemap.xml` `/robots.txt`

Cart storage: there is no `Cart` or `line_items` table. `localStorage["trio-cart"]` is the source of truth until checkout; checkout revalidates prices and stock from the database. `OrderItem` stores the historical order snapshot after purchase.

## 6. Folder structure
```
src/
  app/ (store)/ (auth)/ account/ admin/ api/ ...
  components/ ui/ layout/ brand/ home/ product/ cart/ checkout/ admin/
  actions/ product.ts order.ts address.ts wishlist.ts price.ts settings.ts category.ts
  lib/ auth.ts auth-client.ts session.ts prisma.ts env.ts format.ts cloudinary.ts settings.ts bd-locations.ts utils.ts validators/
  stores/ cart.ts
  proxy.ts   (or middleware.ts depending on Next version)
prisma/ schema.prisma seed.ts
```
`src/lib/bd-locations.ts`: static list of 8 divisions -> 64 districts (upazila as free text input to keep it simple and small).

## 7. Seed data
Admin from env; settings with placeholders; categories Jerseys (Football, Cricket), Trousers (Track pants, Shorts), Accessories (Bags, Socks, Caps, Gloves); 24 realistic sample products (names like "Dhaka Home Jersey 24/25", sizes S-XXL, 2-3 colors, stock 5-40, prices 800-6500, a few with sale prices, a few featured); placeholder images from `https://placehold.co/800x1000/png?text=...` (allow this host in next.config until real Cloudinary images exist); 3 banners.
