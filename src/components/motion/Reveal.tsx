"use client";

import { useEffect, useRef } from "react";

import { loadGsap } from "@/lib/motion";

/**
 * Staggers its direct children in as they scroll into view. Children stay server-rendered.
 * Items already on screen when the script arrives are left alone, so streamed or
 * above-the-fold content never flickers out and back in.
 */
export default function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then((motion) => {
      const root = ref.current;
      if (!motion || !root || cancelled) return;
      const { gsap, ScrollTrigger } = motion;

      const ctx = gsap.context(() => {
        const items = Array.from(root.children).filter(
          (item) => item.getBoundingClientRect().top > window.innerHeight,
        );
        if (items.length === 0) return;

        gsap.set(items, { autoAlpha: 0, y: 32 });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power3.out",
              stagger: 0.06,
              overwrite: true,
            }),
        });
      }, root);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
