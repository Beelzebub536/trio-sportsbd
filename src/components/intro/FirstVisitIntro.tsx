"use client";

import { useEffect, useRef } from "react";

import Ball from "@/components/intro/Ball";
import { INTRO_SEEN_KEY } from "@/lib/intro";

const DUST = Array.from({ length: 9 }, (_, i) => i);

/**
 * First-visit kick-off: a ball resting on an off-white ground is struck, swerves toward the
 * camera in slow motion, flies over it, and the store is revealed where it passed.
 * Shown only when the boot script set `html[data-intro]` (see src/lib/intro.ts).
 */
export default function FirstVisitIntro() {
  const scene = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const squash = useRef<HTMLDivElement>(null);
  const spin = useRef<SVGGElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.intro) return;

    let killed = false;
    const finish = () => {
      delete root.dataset.intro;
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
    };

    import("gsap")
      .then(({ gsap }) => {
        if (killed) return;
        const puffs = dust.current ? Array.from(dust.current.children) : [];
        const tl = gsap.timeline({ delay: 0.45, onComplete: finish });

        // Strike: the ball compresses against the foot, the ground thuds, dust kicks up.
        tl.to(squash.current, { scaleX: 1.16, scaleY: 0.84, duration: 0.07, ease: "power1.in" })
          .addLabel("kick")
          .to(squash.current, { scaleX: 0.94, scaleY: 1.06, duration: 0.12, ease: "power2.out" }, "kick")
          .to(squash.current, { scaleX: 1, scaleY: 1, duration: 0.25, ease: "elastic.out(1, 0.5)" }, "kick+=0.12")
          .fromTo(scene.current, { y: 0 }, { y: 3, duration: 0.05, yoyo: true, repeat: 3, ease: "none" }, "kick")
          .fromTo(
            puffs,
            { x: 0, y: 0, scale: 1, opacity: 0.85 },
            {
              x: (i) => (i - 4) * 16 + gsap.utils.random(-6, 6),
              y: (i) => -10 - (4 - Math.abs(i - 4)) * 7,
              scale: () => gsap.utils.random(1.6, 2.6),
              opacity: 0,
              duration: 0.9,
              ease: "power2.out",
            },
            "kick",
          )

          // Swerving approach: horizontal and vertical motion use different easing, so the
          // path bends left first and then curls back as the ball rises toward the camera.
          .to(flight.current, { x: "-13vw", duration: 0.85, ease: "sine.out" }, "kick")
          .to(flight.current, { y: "-17vh", duration: 0.85, ease: "power1.out" }, "kick")
          .to(flight.current, { scale: 0.58, duration: 0.85, ease: "power2.in" }, "kick")
          .to(spin.current, { rotation: -460, svgOrigin: "0 0", duration: 0.85, ease: "power1.out" }, "kick")
          .to(shadow.current, { x: "-8vw", y: "7vh", scaleX: 1.8, scaleY: 1.4, opacity: 0.15, duration: 0.85, ease: "power1.out" }, "kick")

          // Slow motion as it closes on the camera: growth and spin ease right down.
          .addLabel("slow", "kick+=0.85")
          .to(flight.current, { x: "5vw", duration: 1.35, ease: "sine.inOut" }, "slow")
          .to(flight.current, { y: "-27vh", duration: 1.35, ease: "sine.out" }, "slow")
          .to(flight.current, { scale: 1.1, duration: 1.35, ease: "sine.in" }, "slow")
          .to(spin.current, { rotation: "-=55", svgOrigin: "0 0", duration: 1.35, ease: "none" }, "slow")
          .to(shadow.current, { opacity: 0, duration: 0.6 }, "slow")

          // Over the camera and away, curving on to the right; the store appears behind it.
          .addLabel("exit", "slow+=1.25")
          .to(flight.current, { x: "48vw", y: "-88vh", scale: 3, filter: "blur(8px)", duration: 0.42, ease: "power2.in" }, "exit")
          .to(spin.current, { rotation: "-=220", svgOrigin: "0 0", duration: 0.42, ease: "power2.in" }, "exit")
          .to(ground.current, { "--hole": "170vmax", duration: 0.9, ease: "power2.in" }, "exit-=0.05");

        skip.current = () => tl.progress(1);
      })
      .catch(finish);

    const onKey = () => skip.current();
    window.addEventListener("keydown", onKey);
    return () => {
      killed = true;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="intro fixed inset-0 z-[100] overflow-hidden" onClick={() => skip.current()}>
      <div ref={scene} aria-hidden className="absolute inset-0">
        <div ref={ground} className="intro-ground absolute inset-0 [--hole:-2vmax]" />
        <div className="absolute left-1/2 top-[72%]">
          <div
            ref={shadow}
            className="absolute -left-12 -top-2.5 h-5 w-24 rounded-[50%] bg-[radial-gradient(closest-side,rgb(40_32_20/0.45),transparent)]"
          />
          <div ref={dust} className="absolute -left-1 -top-1">
            {DUST.map((i) => (
              <span key={i} className="absolute h-3 w-3 rounded-full bg-[#bdb3a1] opacity-0 blur-[1px]" />
            ))}
          </div>
          {/* Drawn at 4x and started at quarter scale so it stays sharp right up to the camera. */}
          <div
            ref={flight}
            style={{ transform: "scale(0.25)" }}
            className="absolute -left-[min(32vw,160px)] -top-[min(40vw,200px)] h-[min(64vw,320px)] w-[min(64vw,320px)] will-change-transform"
          >
            <div ref={squash} className="h-full w-full origin-bottom">
              <Ball ref={spin} />
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] right-6 rounded-full bg-black/75 px-5 py-3 text-sm font-semibold text-white"
      >
        Skip intro
      </button>
    </div>
  );
}
