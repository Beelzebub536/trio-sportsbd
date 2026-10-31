# Stadium redesign — design spec (2026-11-01)

Owner decisions: direction "Stadium energy", storefront + light admin, app-style bottom tab bar on phones,
GSAP via a lazy `<Reveal>` wrapper + CSS. Remaining decisions delegated to the agent ("make decisions on your own").

## Goals
- Replace the flat monochrome look with a bold, Bangladesh-rooted sports identity.
- Feel like a shopping app on phones; stay fast (Lighthouse mobile perf 85+, a11y 95+).
- Keep the streaming pattern: page shell renders first, each data section streams behind its own
  `Suspense` fallback (skeleton / `LoadingSurface`). No fallback is removed; they are only restyled.

## Root-cause fixes found during audit
- `tailwind.config.ts` never mapped the shadcn colour tokens, so `text-muted-foreground`, `border-border`,
  `bg-primary`, `bg-secondary`, `text-destructive`, … emitted no CSS anywhere. Map them.
- Headings asked for `"Barlow Condensed"` but the font was only loaded (hashed name) inside `Logo`; load it
  once in the root layout as `--font-display`.

## Visual system
- Tokens (HSL triplets in `globals.css`, consumed via Tailwind `hsl(var(--x))`):
  primary pitch green `#006A4E`, pitch-dark `#00382A`, sale/destructive flag red `#E4002B`,
  volt `#C4F000` (highlight only, never text on white), ink `#0B0F0D`, chalk `#F3F5F2`
  (secondary/muted/accent surfaces), muted text `#5B6660`, border `#DCE2DD`.
- Type: Barlow Condensed 700/800 display (uppercase, tight), Inter body 16px, tabular price numerals.
- Shape: sharp corners; 4px radius only on inputs/chips. Motifs: CSS pitch-stripe texture on green
  surfaces, outlined jersey numerals as decoration.
- Motion tokens: press 150ms (scale .97, CSS), hover/drawer 250ms, reveal 450ms `power3.out`,
  grid stagger 60ms; reduced-motion = final state, no GSAP load. Save-Data skips GSAP.

## Shell
- Announcement bar: pitch-dark, single line on mobile rotating 3 messages (CSS), static row on desktop.
- Header: sticky white, compacts on scroll (class toggle, passive listener); green underline nav; restyled
  CSS mega menu. Mobile top bar: menu, logo, search.
- Mobile bottom tab bar (new, `< lg`): Home, Shop, Search, Saved, Bag(count). Opens existing
  `SearchOverlay` / `CartSheet` (header owns their state; tab bar triggers via a tiny UI store event).
  Hidden on `/product/*`, `/cart`, `/checkout` where a sticky action bar is used. Safe-area aware.
- Footer: pitch-dark with stripe texture, oversized wordmark, existing link columns, WhatsApp pill.

## Home
1. Brand hero (server, static, no DB, CSS intro animation → instant LCP): "Match day starts here",
   two CTAs, outlined "10".
2. Ticker (CSS marquee, pauses on hover/reduced-motion).
3. Category tiles: colour-blocked (green / red / ink / volt) with big numerals; images layered if present.
4. Product rows (New arrivals, Best sellers, On sale) — horizontal snap on mobile, grid on desktop.
5. Featured banners carousel (existing data, restyled) — moved below first row, streams in.
6. Sale band (red), brand promises (green), WhatsApp CTA.
Each data section keeps its `Suspense` + skeleton.

## Commerce pages
- Product card: chalk image well, NEW/discount pill, wishlist, name in display font, tabular price,
  hover lift (CSS); Reveal stagger on grids.
- Listing: restyled header band with title + count, existing toolbar/filters inherit tokens.
- Product page: display-font title, square swatches, chunky size grid, green CTA; mobile sticky
  price + "Add to bag" bar replacing the tab bar.
- Cart/checkout/account/auth/static pages: inherit tokens + button variants; targeted polish only.

## GSAP
- `gsap` dependency only (no `@gsap/react`): `<Reveal>` client wrapper (`useEffect` + `gsap.context`,
  `revert()` on unmount) dynamically imports `gsap` + `ScrollTrigger` after mount, animates its
  children with `ScrollTrigger.batch`-style stagger. Server children stay server components.
  Above-the-fold content is never hidden before JS runs (initial state is applied by GSAP only to
  elements below the fold or at mount time for streamed sections).

## Out of scope
Admin layouts (inherit tokens only), new copy/content strategy, product photography, dark mode.

## Verification
tsc, lint, build, `test:links`; Playwright screenshots at 390×844 and 1366×850 for home, listing,
product, cart, checkout redirect, login; check no horizontal scroll, tab bar not covering content,
reduced-motion renders final state; streaming fallbacks still appear.
