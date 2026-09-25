"use client";

/**
 * Adapted from Skiper UI `skiper58` TextRoll (https://skiper-ui.com, free tier):
 * ported from framer-motion to motion/react, driven by the parent's variant
 * ("rest" / "active") instead of its own hover, spaces preserved, and the
 * duplicated letters hidden from assistive tech.
 */

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_SOFT } from "@/lib/motion";

const STAGGER = 0.012;

const top: Variants = { rest: { y: 0 }, active: { y: "-100%" } };
const bottom: Variants = { rest: { y: "100%" }, active: { y: 0 } };

function Letters({ text, variants }: { text: string; variants: Variants }) {
  const chars = Array.from(text);
  const middle = (chars.length - 1) / 2;
  return chars.map((char, i) => (
    <motion.span
      // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static label
      key={i}
      variants={variants}
      transition={{
        duration: 0.42,
        ease: EASE_SOFT,
        delay: STAGGER * Math.abs(i - middle),
      }}
      className="inline-block"
    >
      {char === " " ? " " : char}
    </motion.span>
  ));
}

export function TextRoll({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="block">
        <Letters text={children} variants={top} />
      </span>
      <span aria-hidden className="absolute inset-0 block">
        <Letters text={children} variants={bottom} />
      </span>
    </span>
  );
}
