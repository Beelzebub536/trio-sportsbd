---
name: adidas-ui
description: Design rules for the Adidas-inspired look and feel of trio-sportsbd. Load for any storefront or admin UI work.
---
# Stadium UI rules (replaces the original Adidas look, 2026-11-01)

Full spec: `docs/superpowers/specs/2026-11-01-stadium-redesign-design.md`. Tokens live in `src/app/globals.css` and are mapped in `tailwind.config.ts`; never hard-code hex values in components.

## Look
- Palette: pitch green `primary` (#006A4E), `pitch-dark` (#00382A) for dark bands, flag red `sale`/`destructive` (#E4002B) only for sale, discounts and errors, ink `foreground`, chalk `secondary` surfaces, `muted-foreground` text. No neon accent.
- Display type: Barlow Condensed 700/800 via `font-display` (loaded once in the root layout); headings are uppercase automatically. Body: Inter 16px. Prices use the `price` class (tabular numerals).
- Sharp corners by default; `rounded-full` only for pills (badges, chips, wishlist heart, WhatsApp pill).
- Signature motifs: `pitch-stripes` class for green surfaces, outlined jersey numerals (`-webkit-text-stroke`) as decoration. Spend boldness in one place per page.
- Avoid: tracked-out ALL-CAPS eyebrow labels, `->` arrows on buttons, `A · B` meta strings.
- Buttons: shadcn `Button` (green default, outline = ink border). Add the `press` class to tappable custom elements. Touch targets >= 44px.
- Phones: fixed bottom tab bar (`MobileTabBar`), hidden on product/cart/checkout; product page uses `StickyBuyBar`. Store layout pads for it via `--tabbar-h`.
- Motion: CSS for hover/press/hero; GSAP only through `<Reveal>` / `loadGsap()` (lazy, skipped for reduced-motion and Save-Data). Never hide content that is already on screen.
- Loading: keep every `Suspense` fallback; skeletons use `Skeleton` (chalk + shimmer) and `LoadingSurface`.

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
