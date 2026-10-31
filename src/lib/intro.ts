export const INTRO_SEEN_KEY = "trio-intro-seen";

function boot(seenKey: string) {
  try {
    const path = location.pathname;
    const forced = location.search.includes("intro=1");
    // Only the storefront layout renders the overlay.
    const storefront = !path.startsWith("/admin") && !path.startsWith("/login") && !path.startsWith("/signup");
    const eligible =
      !localStorage.getItem(seenKey) &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData &&
      !/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent);
    if (storefront && (forced || eligible)) document.documentElement.dataset.intro = "1";
  } catch {}
}

/**
 * Inline script that runs before first paint: only first-time, motion-OK, non-bot visitors get
 * `html[data-intro]`, which shows the intro overlay via CSS. `?intro=1` forces it for previews.
 */
export const INTRO_BOOT = `(${boot.toString()})(${JSON.stringify(INTRO_SEEN_KEY)})`;
