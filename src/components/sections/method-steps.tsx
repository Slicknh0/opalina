"use client";

import { useEffect, useRef, useState } from "react";
import type { MethodStep } from "@/content/clinic";
import { cn } from "@/lib/cn";

/**
 * The method's steps. The step in the middle of the viewport gets the accent
 * marker; every step keeps full text contrast.
 */
export function MethodSteps({ steps }: { steps: readonly MethodStep[] }) {
  const [current, setCurrent] = useState<number | null>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(items.current.indexOf(entry.target as HTMLLIElement));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const item of items.current) if (item) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <ol className="space-y-16 lg:space-y-0">
      {steps.map((step, i) => (
        <li
          key={step.title}
          ref={(el) => {
            items.current[i] = el;
          }}
          aria-current={current === i ? "step" : undefined}
          className="border-t border-border pt-6 lg:flex lg:min-h-[44vh] lg:flex-col lg:justify-center lg:border-t-0 lg:pt-0"
        >
          <p
            className={cn(
              "font-mono text-caption transition-colors duration-(--duration-reveal)",
              current === null || current === i ? "text-accent" : "text-muted",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-3 font-display text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-light leading-tight">
            {step.title}
          </h3>
          <p className="mt-4 max-w-[46ch] text-supporting text-foreground/80">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
