"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion honours prefers-reduced-motion for transform and layout animations
 * itself, so components render the same markup on server and client instead
 * of branching on the media query during render (a hydration mismatch).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
