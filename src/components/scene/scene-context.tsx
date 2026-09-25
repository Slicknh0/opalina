"use client";

import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFirstInteraction } from "@/hooks/use-first-interaction";
import { cn } from "@/lib/cn";
import { beatForProgress, SCENE, wipeProgress } from "@/lib/scene";

type SceneState = {
  progress: MotionValue<number>;
  /** Heavy layers (frames, labels) may load: the visitor has interacted. */
  armed: boolean;
  motionAllowed: boolean;
};

const SceneContext = createContext<SceneState | null>(null);

function useScene(): SceneState {
  const scene = useContext(SceneContext);
  if (!scene) throw new Error("Scene islands must render inside SceneProvider");
  return scene;
}

/**
 * The pinned track of the tooth scene. Owns scroll progress and writes the
 * current beat straight to `data-beat` on the section, so beat changes restyle
 * the server-rendered copy through CSS without re-rendering React.
 */
export function SceneProvider({
  children,
  className,
  trackClassName,
  stickyClassName,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  stickyClassName?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const interacted = useFirstInteraction();
  // Reaching the layers beat by any route (reload, deep link, scroll restored
  // before hydration) counts as engaged: load the layers.
  const [pastTurn, setPastTurn] = useState(false);
  const armed = interacted || pastTurn;
  const [motionAllowed, setMotionAllowed] = useState(false);

  const writeBeat = useCallback((p: number) => {
    const el = section.current;
    const beat = beatForProgress(p);
    if (el && el.dataset.beat !== beat) el.dataset.beat = beat;
    if (p > SCENE.turnEnd) setPastTurn(true);
  }, []);
  useMotionValueEvent(scrollYProgress, "change", writeBeat);

  useEffect(() => {
    writeBeat(scrollYProgress.get());
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [scrollYProgress, writeBeat]);

  return (
    <SceneContext.Provider
      value={{ progress: scrollYProgress, armed, motionAllowed }}
    >
      <section
        ref={section}
        id="inicio"
        aria-labelledby="hero-title"
        data-beat="turn"
        className={cn("group/scene relative", className)}
      >
        <div ref={track} className={trackClassName}>
          <div className={stickyClassName}>{children}</div>
        </div>
      </section>
    </SceneContext.Provider>
  );
}

/** Oval mask that grows from the tooth's centre as a wipe progresses. */
const ellipse = (t: number) =>
  `ellipse(${(t * 75).toFixed(2)}% ${(t * 90).toFixed(2)}% at 50% 50%)`;

/** A still revealed by an oval wipe starting at `start` scroll progress. */
export function WipeLayer({
  start,
  children,
  className,
}: {
  start: number;
  children: ReactNode;
  className?: string;
}) {
  const { progress } = useScene();
  const clipPath = useTransform(progress, (p) =>
    ellipse(wipeProgress(p, start)),
  );
  return (
    <motion.div style={{ clipPath }} className={className}>
      {children}
    </motion.div>
  );
}

// Frames and labels (Anime.js) load only after the first interaction, so
// neither competes with the first paint.
const FrameCanvas = dynamic(
  () => import("./frame-canvas").then((m) => m.FrameCanvas),
  { ssr: false },
);
const LayerLabels = dynamic(
  () => import("./layer-labels").then((m) => m.LayerLabels),
  { ssr: false },
);

export function SceneFrames({ className }: { className?: string }) {
  const { progress, armed, motionAllowed } = useScene();
  if (!armed) return null;
  return (
    <FrameCanvas
      progress={progress}
      active={motionAllowed}
      className={className}
    />
  );
}

export function SceneLabels() {
  const { progress, armed } = useScene();
  return armed ? <LayerLabels progress={progress} /> : null;
}
