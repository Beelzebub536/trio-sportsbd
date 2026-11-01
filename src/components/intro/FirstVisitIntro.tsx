"use client";

import { useEffect, useRef } from "react";

import { INTRO_SEEN_KEY } from "@/lib/intro";

// The ball flies into the lens and fills the whole frame from ~2.9 s (frame 88) of the 3.2 s render.
const REVEAL_AT_SECONDS = 2.9;

/**
 * First-visit kick-off, rendered in Blender (scripts/blender/intro_kick.py): a ball is struck,
 * swerves toward the camera in slow motion and flies into the lens; once it fills the frame, the
 * store opens up from the centre behind it. Shown only when the boot script set `html[data-intro]` (see src/lib/intro.ts).
 */
export default function FirstVisitIntro() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const player = video.current;
    if (!root.dataset.intro || !player) return;

    let done = false;
    finish.current = () => {
      if (done) return;
      done = true;
      player.pause();
      delete root.dataset.intro;
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
    };
    const reveal = () => stage.current?.classList.add("intro-reveal");
    const onTime = () => {
      if (player.currentTime >= REVEAL_AT_SECONDS) reveal();
    };
    const end = () => finish.current();
    // Normally the reveal's transitionend finishes; this covers browsers that can't animate it.
    const onEnded = () => {
      reveal();
      setTimeout(end, 1000);
    };

    const orientation = matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    player.src = `/intro/kick-${orientation}.mp4`;
    player.addEventListener("timeupdate", onTime);
    player.addEventListener("ended", onEnded);
    const stageEl = stage.current;
    stageEl?.addEventListener("transitionend", end);
    window.addEventListener("keydown", end);
    // Autoplay can be refused (e.g. iOS Low Power Mode): skip rather than show a frozen frame.
    player.muted = true; // React doesn't reliably reflect `muted` before autoplay checks
    // AbortError just means a newer load replaced this one (e.g. StrictMode re-running the effect).
    player.play().catch((error: DOMException) => {
      if (error.name !== "AbortError") finish.current();
    });

    return () => {
      player.removeEventListener("timeupdate", onTime);
      player.removeEventListener("ended", onEnded);
      stageEl?.removeEventListener("transitionend", end);
      window.removeEventListener("keydown", end);
    };
  }, []);

  return (
    <div className="intro fixed inset-0 z-[100]" onClick={() => finish.current()}>
      <div ref={stage} aria-hidden className="intro-stage absolute inset-0 bg-[#101313]">
        <picture>
          <source media="(orientation: portrait)" srcSet="/intro/kick-portrait.webp" />
          <img src="/intro/kick-landscape.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
        <video
          ref={video}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <button
        type="button"
        className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] right-6 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
      >
        Skip intro
      </button>
    </div>
  );
}
