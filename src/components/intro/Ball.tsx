import { forwardRef } from "react";

/** Pentagon points; `squash` < 1 compresses it along the radial direction `facing` (foreshortening). */
const pentagon = (cx: number, cy: number, r: number, rotation: number, facing = 0, squash = 1) => {
  const fx = Math.cos((facing * Math.PI) / 180);
  const fy = Math.sin((facing * Math.PI) / 180);
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((rotation + i * 72) * Math.PI) / 180;
    let dx = r * Math.cos(a);
    let dy = r * Math.sin(a);
    const radial = dx * fx + dy * fy;
    dx -= radial * (1 - squash) * fx;
    dy -= radial * (1 - squash) * fy;
    return `${(cx + dx).toFixed(2)},${(cy + dy).toFixed(2)}`;
  }).join(" ");
};

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};

// Panel layout of a classic ball seen front-on: a centre pentagon and five around it
// (squashed toward the rim to suggest the sphere curving away).
const OUTER = [-90, -18, 54, 126, 198].map((deg) => {
  const [x, y] = polar(39, deg);
  return { deg, x, y };
});

/**
 * Vector football. Only the panel group rotates (via the forwarded ref); the light, shade and
 * rim stay fixed, so it reads as a lit sphere spinning rather than a flat disc.
 */
const Ball = forwardRef<SVGGElement>(function Ball(_, spinRef) {
  return (
    <svg viewBox="-50 -50 100 100" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="ball-light" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f2f2ef" />
          <stop offset="80%" stopColor="#c9c8c2" />
          <stop offset="100%" stopColor="#8d8b84" />
        </radialGradient>
        <radialGradient id="ball-shade" cx="34%" cy="28%" r="78%">
          <stop offset="50%" stopColor="#1a1712" stopOpacity="0" />
          <stop offset="88%" stopColor="#1a1712" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1a1712" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="ball-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id="ball-soft" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
        <clipPath id="ball-clip">
          <circle r="49" />
        </clipPath>
      </defs>

      <circle r="49" fill="url(#ball-light)" />
      <g clipPath="url(#ball-clip)">
        <g ref={spinRef} filter="url(#ball-soft)">
          {/* Thin seams joining the panels. */}
          <g stroke="#9b9a94" strokeWidth="0.7" fill="none">
            {OUTER.map(({ deg, x, y }, i) => {
              const [sx, sy] = polar(13, deg);
              const next = OUTER[(i + 1) % 5];
              return (
                <g key={deg}>
                  <line x1={sx} y1={sy} x2={x * 0.68} y2={y * 0.68} />
                  <line x1={x} y1={y} x2={(x + next.x) / 2} y2={(y + next.y) / 2} />
                </g>
              );
            })}
          </g>
          <polygon points={pentagon(0, 0, 13, -90)} fill="#1c1d1b" stroke="#1c1d1b" strokeWidth="1.5" strokeLinejoin="round" />
          {OUTER.map(({ deg, x, y }) => (
            <polygon
              key={deg}
              points={pentagon(x, y, 12, deg + 180, deg, 0.72)}
              fill="#1c1d1b"
              stroke="#1c1d1b"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </g>
      <circle r="49" fill="url(#ball-shade)" />
      <ellipse cx="-17" cy="-20" rx="15" ry="9" fill="url(#ball-sheen)" transform="rotate(-35 -17 -20)" />
    </svg>
  );
});

export default Ball;
