"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_SOFT } from "@/lib/motion";

/**
 * A front view of a smile reduced to ovals: centrals largest, then laterals,
 * canines and premolars, set along a gentle curve. Only the fill animates.
 */
const TEETH = [
  { dx: 0.5, rx: 25, ry: 44 },
  { dx: 1.46, rx: 20, ry: 37 },
  { dx: 2.3, rx: 21, ry: 39 },
  { dx: 3.1, rx: 18, ry: 32 },
];

const CENTER = 300;
const SPACING = 52;

const ovals = TEETH.flatMap((tooth) =>
  [-1, 1].map((side) => {
    const cx = CENTER + side * tooth.dx * SPACING;
    // Teeth rise slightly toward the back, following the smile line.
    const cy = 120 - tooth.dx * tooth.dx * 4.2;
    return { key: `${side}-${tooth.dx}`, cx, cy, rx: tooth.rx, ry: tooth.ry };
  }),
);

export function ShadeArch({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      viewBox="100 40 400 150"
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      {ovals.map((o) => (
        <g key={o.key}>
          <motion.ellipse
            cx={o.cx}
            cy={o.cy}
            rx={o.rx}
            ry={o.ry}
            initial={false}
            animate={{ fill: color }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: DURATION.reveal, ease: EASE_SOFT }
            }
            stroke="rgb(35 39 45 / 0.18)"
            strokeWidth={0.75}
          />
          {/* Enamel translucency: a soft highlight toward the incisal edge. */}
          <ellipse
            cx={o.cx - o.rx * 0.22}
            cy={o.cy - o.ry * 0.3}
            rx={o.rx * 0.38}
            ry={o.ry * 0.46}
            fill="rgb(255 255 255 / 0.38)"
          />
        </g>
      ))}
    </svg>
  );
}
