"use client";

/**
 * Adapted from Cult UI's `text-animate` (https://www.cult-ui.com, MIT):
 * same container/child variant structure and in-view trigger, rewritten as a
 * "light sweep" — words brighten in sequence, like light crossing enamel.
 * Screen readers get the plain sentence; the animated words are presentational.
 */

import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ElementType, Fragment } from "react";
import { EASE_SOFT } from "@/lib/motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const word: Variants = {
  hidden: { opacity: 0.16 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: EASE_SOFT } },
};

type LightSweepTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
};

export function LightSweepText({
  text,
  as: Tag = "p",
  className,
}: LightSweepTextProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -25% 0px" }}
      >
        {text.split(" ").map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static sentence, order never changes
          <Fragment key={i}>
            {i > 0 && " "}
            <motion.span variants={word} className="inline-block">
              {w}
            </motion.span>
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
