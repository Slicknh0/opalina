"use client";

/**
 * Adapted from Skiper UI `skiper58` TextRoll (https://skiper-ui.com, free tier):
 * ported from framer-motion to motion/react, driven by the parent's variant
 * ("rest" / "active") instead of its own hover, and hidden from assistive tech
 * behind a plain-text copy. Each word rolls inside its own clipped box, so a
 * long name wraps only between words and never overlaps across lines.
 */

import { motion, type Variants } from "motion/react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { EASE_SOFT } from "@/lib/motion";

const STAGGER = 0.012;

const top: Variants = { rest: { y: 0 }, active: { y: "-100%" } };
const bottom: Variants = { rest: { y: "100%" }, active: { y: 0 } };

function Letters({
  chars,
  offset,
  middle,
  variants,
}: {
  chars: string[];
  offset: number;
  middle: number;
  variants: Variants;
}) {
  return chars.map((char, i) => (
    <motion.span
      // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static label
      key={i}
      variants={variants}
      transition={{
        duration: 0.42,
        ease: EASE_SOFT,
        delay: STAGGER * Math.abs(offset + i - middle),
      }}
      className="inline-block"
    >
      {char}
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
  const words = children.split(" ");
  const middle = (children.length - 1) / 2;
  let offset = 0;

  return (
    <span className={cn("block", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, w) => {
          const chars = Array.from(word);
          const start = offset;
          offset += chars.length + 1;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: words of a static label
            <Fragment key={w}>
              {w > 0 && " "}
              <span
                data-roll-word=""
                className="relative inline-block overflow-hidden whitespace-nowrap align-top"
              >
                <span className="block">
                  <Letters
                    chars={chars}
                    offset={start}
                    middle={middle}
                    variants={top}
                  />
                </span>
                <span className="absolute inset-0 block">
                  <Letters
                    chars={chars}
                    offset={start}
                    middle={middle}
                    variants={bottom}
                  />
                </span>
              </span>
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
