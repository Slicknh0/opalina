/**
 * Adapted from Skiper UI `skiper58` TextRoll (https://skiper-ui.com, free tier).
 * The letter roll now runs on CSS transitions with per-letter delays, driven by
 * `data-active="true"` on the nearest `group/roll` ancestor — the same effect
 * without one animation component per letter (hundreds on this page), which
 * kept hydration expensive. Each word rolls inside its own clipped box, so a
 * long name wraps only between words; the plain text is kept for assistive tech.
 */

import { Fragment } from "react";
import { cn } from "@/lib/cn";

const STAGGER_MS = 12;

const letter =
  "inline-block transition-transform duration-[420ms] ease-soft motion-reduce:transition-none";

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
          const delay = (i: number) => ({
            transitionDelay: `${Math.round(STAGGER_MS * Math.abs(start + i - middle))}ms`,
          });
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: words of a static label
            <Fragment key={w}>
              {w > 0 && " "}
              <span
                data-roll-word=""
                className="relative inline-block overflow-hidden whitespace-nowrap align-top"
              >
                <span className="block">
                  {chars.map((c, i) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static label
                      key={i}
                      className={cn(
                        letter,
                        "group-data-[active=true]/roll:-translate-y-full",
                      )}
                      style={delay(i)}
                    >
                      {c}
                    </span>
                  ))}
                </span>
                <span className="absolute inset-0 block">
                  {chars.map((c, i) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static label
                      key={i}
                      className={cn(
                        letter,
                        "translate-y-full group-data-[active=true]/roll:translate-y-0",
                      )}
                      style={delay(i)}
                    >
                      {c}
                    </span>
                  ))}
                </span>
              </span>
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
