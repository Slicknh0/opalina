"use client";

import { animate, onScroll, svg } from "animejs";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * The dental arch seen from above, drawn as the reader moves through the
 * enclosing section. Anime.js owns this path's stroke exclusively. With
 * reduced motion the arch is simply shown complete.
 */
export function ArchLine({
  className,
  steps = 4,
}: {
  className?: string;
  steps?: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const section = path?.closest("section");
    if (!path || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = animate(svg.createDrawable(path), {
      draw: ["0 0", "0 1"],
      ease: "linear",
      autoplay: onScroll({
        target: section,
        enter: "center top",
        leave: "bottom bottom",
        sync: 0.4,
      }),
    });
    return () => {
      animation.revert();
    };
  }, []);

  // Points spread along the arch, one per step of the method.
  const marks = Array.from({ length: steps }, (_, i) => {
    const t = (i + 0.5) / steps;
    const angle = Math.PI * (1 - t);
    return { x: 160 + 130 * Math.cos(angle), y: 40 + 170 * Math.sin(angle) };
  });

  return (
    <svg
      viewBox="0 0 320 240"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M30 40 C30 150 90 210 160 210 C230 210 290 150 290 40"
        fill="none"
        stroke="rgb(35 39 45 / 0.1)"
        strokeWidth={1}
      />
      <path
        ref={pathRef}
        d="M30 40 C30 150 90 210 160 210 C230 210 290 150 290 40"
        fill="none"
        stroke="#3d6b8a"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {marks.map((m) => (
        <circle
          key={m.x}
          cx={m.x}
          cy={m.y}
          r={3}
          fill="#f5f5f2"
          stroke="#3d6b8a"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
