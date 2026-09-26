"use client";

import { type MotionValue, useMotionValueEvent } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFrameLoader } from "@/hooks/use-frame-loader";
import { cn } from "@/lib/cn";
import {
  FRAME_SETS,
  type FrameSet,
  frameForProgress,
  frameSetFor,
  pickDrawableFrame,
} from "@/lib/scene";

type FrameCanvasProps = {
  progress: MotionValue<number>;
  /** Load and draw frames only when true (interaction seen, motion allowed). */
  active: boolean;
  className?: string;
};

/**
 * The rotation beat: draws the frame for the current scroll progress.
 * Stays transparent — letting the poster underneath show — until a frame at
 * or below the target is decoded, so the visitor never sees a blank canvas.
 */
export function FrameCanvas({ progress, active, className }: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawn = useRef<number | null>(null);
  // Client-only component: pick the set for this screen before any fetch starts.
  const [set, setSet] = useState<FrameSet>(() =>
    typeof window === "undefined"
      ? FRAME_SETS.desktop
      : frameSetFor(window.innerWidth),
  );
  const [visible, setVisible] = useState(false);
  const { getBitmap, loaded } = useFrameLoader(set, active);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => setSet(frameSetFor(window.innerWidth));
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 150);
    };
    update();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /** Draws the frame for the current progress; false when nothing is drawable. */
  const draw = useCallback((): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const target = frameForProgress(progress.get(), set.count);
    const index = pickDrawableFrame(target, loaded);
    if (index === null) return false;
    if (index === drawn.current) return true;
    const bitmap = getBitmap(index);
    const ctx = canvas.getContext("2d");
    if (!bitmap || !ctx) return false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    drawn.current = index;
    setVisible(true);
    return true;
  }, [progress, set, loaded, getBitmap]);

  // Keep the backing store matched to the rendered size and pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      // Resizing clears the canvas: if nothing can be redrawn, show the poster.
      drawn.current = null;
      if (!draw()) setVisible(false);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  // Newly loaded frames may be closer to the target than what is drawn.
  useEffect(() => {
    drawn.current = null;
    draw();
  }, [draw]);

  useMotionValueEvent(progress, "change", () => {
    requestAnimationFrame(draw);
  });

  return (
    <div
      aria-hidden="true"
      // The stage hides the poster while a frame is drawn (no double exposure).
      data-drawn={visible}
      className={cn(
        "absolute inset-0 transition-opacity duration-(--duration-ui)",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <canvas ref={canvasRef} data-scene-frames="" className="h-full w-full" />
    </div>
  );
}
