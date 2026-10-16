---
name: adidas-ui
description: Design rules for the Adidas-inspired look and feel of trio-sportsbd. Load for any storefront or admin UI work.
---
# Adidas-style UI rules

## Look
- Palette: black `#000`, white `#fff`, light grey surfaces `#ecefef`, mid grey text `#767677`, ONE accent (electric green `#c4f000` or red `#e4002b`; pick one in `globals.css` tokens and reuse). Sale prices in red.
- Sharp corners everywhere (`--radius: 0`). Buttons are rectangular, black fill with white text, with a small arrow icon on the right (`->`); hover shifts the arrow. Secondary button = white with black 1px border.
- Typography: headings in a bold condensed uppercase face (Barlow Condensed or Oswald, weights 700-800, tight tracking) loaded with `next/font/google`; body in Inter. Huge hero headings; small uppercase labels (12px, tracking wide).
- Lots of whitespace, edge-to-edge imagery, grid of product cards with no borders or shadows. Links use a 2px underline that thickens on hover.
- Motion: subtle only (150-250 ms). Respect `prefers-reduced-motion`.

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
