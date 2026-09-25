"use client";

import { createTimeline, stagger, svg } from "animejs";
import { type MotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";
import { clinic } from "@/content/clinic";
import { SCENE, wipeProgress } from "@/lib/scene";

// Anchor points on the cutaway render and where each label sits, in % of the stage.
const LAYERS = [
  { key: "enamel", anchor: [40, 23], label: [84, 20] },
  { key: "pulp", anchor: [48, 40], label: [84, 42] },
  { key: "dentine", anchor: [34, 54], label: [84, 64] },
] as const;

/** The layers beat starts drawing just after the cutaway wipe begins. */
const LABELS_START = SCENE.turnEnd + 0.04;

/**
 * Leader lines and names for enamel, dentine and pulp over the cutaway still.
 * Anime.js owns the line draw and the label fade, seeked by scroll progress.
 * The wrapper's visibility per beat is CSS (data-beat on the scene).
 */
export function LayerLabels({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<ReturnType<typeof createTimeline> | null>(null);
  const labels = clinic.scene.beats.layers.labels;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const paths = el.querySelectorAll<SVGPathElement>("path");
    const names = el.querySelectorAll<HTMLElement>("[data-label]");
    const tl = createTimeline({ autoplay: false })
      .add(svg.createDrawable(paths), {
        draw: ["0 0", "0 1"],
        duration: 600,
        delay: stagger(120),
        ease: "out(3)",
      })
      .add(
        names,
        { opacity: [0, 1], duration: 300, delay: stagger(120) },
        "-=400",
      );
    tl.seek(wipeProgress(progress.get(), LABELS_START) * tl.duration);
    timeline.current = tl;
    return () => {
      tl.revert();
      timeline.current = null;
    };
  }, [progress]);

  useMotionValueEvent(progress, "change", (p) => {
    const tl = timeline.current;
    if (tl) tl.seek(wipeProgress(p, LABELS_START) * tl.duration);
  });

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--duration-ui) group-data-[beat=layers]/scene:opacity-100 motion-reduce:hidden"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {LAYERS.map(({ key, anchor, label }) => (
          <path
            key={key}
            d={`M${anchor[0]} ${anchor[1]} L${label[0] - 10} ${label[1]} L${label[0] - 1} ${label[1]}`}
            fill="none"
            stroke="#3d6b8a"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {LAYERS.map(({ key, anchor }) => (
          <circle
            key={key}
            cx={anchor[0]}
            cy={anchor[1]}
            r={0.9}
            fill="#3d6b8a"
          />
        ))}
      </svg>
      {LAYERS.map(({ key, label }) => (
        <p
          key={key}
          data-label=""
          className="absolute -translate-y-1/2 font-mono text-caption text-accent"
          style={{ left: `${label[0]}%`, top: `${label[1]}%` }}
        >
          {labels[key]}
        </p>
      ))}
    </div>
  );
}
