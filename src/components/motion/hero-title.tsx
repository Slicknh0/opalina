"use client";

import { animate, stagger } from "animejs";
import { splitText } from "animejs/text";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type HeroTitleProps = { children: string; className?: string };

/**
 * The page's one orchestrated moment: words rise into place, line by line.
 * Anime.js owns this element's words exclusively. The title starts hidden only
 * when JS is running (html.js) and motion is allowed; see layout.tsx.
 */
export function HeroTitle({ children, className }: HeroTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      el.style.opacity = "1";
      return;
    }

    const split = splitText(el, { words: { wrap: "clip" } });
    el.style.opacity = "1";
    const animation = animate(split.words, {
      y: ["110%", "0%"],
      duration: 1000,
      delay: stagger(70, { start: 150 }),
      ease: "out(4)",
    });

    return () => {
      animation.revert();
      split.revert();
    };
  }, []);

  return (
    <h1
      ref={ref}
      className={cn(
        "in-[.js]:opacity-0 motion-reduce:in-[.js]:opacity-100",
        className,
      )}
    >
      {children}
    </h1>
  );
}
