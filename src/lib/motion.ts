"use client";

type Motion = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let loader: Promise<Motion | null> | null = null;

/** Motion is opt-out: reduced-motion and Save-Data visitors never download GSAP. */
export function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData;
}

/** Lazily loads GSAP + ScrollTrigger once, after first paint, as a separate chunk. */
export function loadGsap(): Promise<Motion | null> {
  if (!motionAllowed()) return Promise.resolve(null);
  loader ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
    .then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    })
    .catch(() => null);
  return loader;
}
