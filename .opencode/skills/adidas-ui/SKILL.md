---
name: adidas-ui
description: Design rules for the Adidas-inspired look and feel of trio-sportsbd. Load for any storefront or admin UI work.
---
# Night-match UI rules (dark theme, 2026-11-01; replaces the Adidas and Stadium looks)

Tokens live in `src/app/globals.css` (dark-first) and are mapped in `tailwind.config.ts`; never hard-code hex values in components.

## Look
- Dark charcoal surfaces (`background`, `card`, `secondary`), off-white text, floodlight green `primary` for CTAs and active states (dark text on it), `sale`/`destructive` red only for sale, discounts and errors. `floodlight` class = green-glow panel.
- Type: Archivo 700/800 (`font-display`) for headings in sentence case with tight tracking; Inter body 16px. No all-caps labels, no tracked-out eyebrows. Prices use the `price` class.
- Shape: rounded (`--radius` 0.75rem), pill buttons (`rounded-full`), photo tiles `rounded-2xl`, bands `rounded-3xl`.
- Imagery: editorial photos from `src/lib/photos.ts` (Unsplash, no third-party logos) behind dark gradients for legibility.
- Phones: fixed bottom tab bar (`MobileTabBar`), hidden on product/cart/checkout; product page uses `StickyBuyBar`. Store layout pads for it via `--tabbar-h`.
- Motion: CSS for hover/press; GSAP only through `<Reveal>` / `loadGsap()` (lazy; skipped for reduced motion and Save-Data). Never hide content already on screen.
- First-visit intro: Blender render in `public/intro/` (source `scripts/blender/intro_kick.py`, encode with `scripts/blender/encode_intro.mjs`), played by `FirstVisitIntro`; boot logic in `src/lib/intro.ts`. `?intro=1` previews it.
- Loading: keep every `Suspense` fallback; skeletons use `Skeleton` (shimmer) and `LoadingSurface`.

## Components
- Announcement bar (black, small white text, "Free delivery over ৳X" from settings) above the header.
- Sticky header: logo placeholder left, main nav center (MEN, WOMEN, KIDS, JERSEYS, TROUSERS, ACCESSORIES, SALE), search + wishlist + account + bag icon (with count) right. Desktop mega menu on hover/focus; mobile = full-screen slide-in menu with accordion.
- Product card: 4:5 image, second image on hover, color-count text, name (uppercase small), category line in grey, price (sale price red + original struck through + `-XX%` badge), wishlist heart top-right, "NEW" tag when created in the last 30 days.
- Product page: left sticky gallery (thumbnails vertical on desktop, swipe on mobile), right column with title, price, color swatches (square), size grid (3-4 columns, disabled+struck for out of stock), "ADD TO BAG" full-width black button, WhatsApp "Ask about this product" link, accordions (description, size guide, shipping and returns), low stock text ("Only 3 left").
- Listing page: top bar with result count, sort select, filter button; desktop left sidebar filters with accordions; mobile filters in a bottom sheet; active filters shown as removable chips; "Load more" button with count ("Showing 24 of 96").
- Cart drawer slides from right; free-delivery progress bar; line items with qty stepper.
- Skeleton loaders for lists; empty states with a clear action; toasts for feedback (sonner).
- Admin: clean white dashboard, left sidebar, data tables (TanStack Table or shadcn table) with search, sorting, pagination, inline editing where specified.

## Quality bar
- Lighthouse mobile target: performance 85+, accessibility 95+.
- Every image has `alt`; every icon button has `aria-label`; visible focus ring (2px accent/black).
- Test at 375px, 768px, 1280px widths. No horizontal scroll.
