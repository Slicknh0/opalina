"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useWebGL } from "@/hooks/use-webgl";
import { cn } from "@/lib/cn";
import { DURATION, EASE_SOFT } from "@/lib/motion";
import type { ShaderVariant } from "./ambient-shader";
import { StaticGlow } from "./static-glow";

const AmbientShader = dynamic(() => import("./ambient-shader"), { ssr: false });

type ShaderSlotProps = { variant: ShaderVariant; className?: string };

/**
 * Static glow always; the WebGL shader on top only when it can run well:
 * WebGL available, motion allowed, and the slot near the viewport.
 * Leaving the viewport unmounts the canvas, which stops GPU work.
 */
export function ShaderSlot({ variant, className }: ShaderSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  const reduceMotion = useReducedMotion();
  const webgl = useWebGL();
  const live = inView && webgl === true && !reduceMotion;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <StaticGlow />
      {live && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.hero * 1.4, ease: EASE_SOFT }}
        >
          <AmbientShader variant={variant} />
        </motion.div>
      )}
    </div>
  );
}
