"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { StaticGlow } from "@/components/shader/static-glow";
import { ButtonLink } from "@/components/ui/button";
import { TextRoll } from "@/components/ui/text-roll";
import type { Treatment } from "@/content/clinic";
import { cn } from "@/lib/cn";
import { DURATION, EASE_PORCELAIN } from "@/lib/motion";
import { TreatmentSpecimen } from "./treatment-specimen";

type TreatmentIndexProps = { treatments: Treatment[]; bookingHref: string };

/**
 * Editorial index: always one treatment open. Hover (fine pointers), focus,
 * arrows and click all open a row; on large screens the sticky panel shows
 * the open treatment's specimen.
 */
export function TreatmentIndex({
  treatments,
  bookingHref,
}: TreatmentIndexProps) {
  const [active, setActive] = useState(treatments[0]?.id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: DURATION.ui * 1.4, ease: EASE_PORCELAIN };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = treatments.length - 1;
    const next =
      event.key === "ArrowDown"
        ? Math.min(index + 1, last)
        : event.key === "ArrowUp"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };

  const onPointerEnter = (id: string) => {
    if (window.matchMedia("(min-width: 64rem) and (pointer: fine)").matches) {
      setActive(id);
    }
  };

  const current = treatments.find((t) => t.id === active);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <ul className="border-b border-border lg:col-span-7">
        {treatments.map((treatment, index) => {
          const open = treatment.id === active;
          return (
            <li key={treatment.id} className="border-t border-border">
              <motion.button
                ref={(el) => {
                  buttons.current[index] = el;
                }}
                type="button"
                id={`tratamento-${treatment.id}`}
                aria-expanded={open}
                aria-controls={open ? `painel-${treatment.id}` : undefined}
                onClick={() => setActive(treatment.id)}
                onFocus={() => setActive(treatment.id)}
                onPointerEnter={() => onPointerEnter(treatment.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                initial={false}
                animate={open && !reduceMotion ? "active" : "rest"}
                className={cn(
                  "flex w-full items-baseline justify-between gap-6 py-5 text-left transition-colors duration-(--duration-ui) lg:py-6",
                  open
                    ? "text-foreground"
                    : "text-foreground/50 hover:text-foreground/80",
                )}
              >
                <TextRoll className="font-display text-[clamp(1.75rem,1.25rem+1.7vw,2.75rem)] font-light leading-[1.05] tracking-[-0.015em]">
                  {treatment.name}
                </TextRoll>
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full border border-current transition-colors duration-(--duration-ui)",
                    open && "border-accent bg-accent",
                  )}
                />
              </motion.button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`painel-${treatment.id}`}
                    role="region"
                    aria-labelledby={`tratamento-${treatment.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={transition}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 pb-8 sm:grid-cols-[1fr_9rem] lg:block lg:pr-16">
                      <div className="space-y-4">
                        <p className="max-w-[52ch] text-supporting text-foreground/80">
                          {treatment.summary}
                        </p>
                        <p className="max-w-[52ch] text-[0.9375rem] text-muted">
                          <span className="text-foreground">
                            Indicado para:{" "}
                          </span>
                          {treatment.indication}
                        </p>
                        <ButtonLink href={bookingHref} variant="ghost">
                          Agendar avaliação
                        </ButtonLink>
                      </div>
                      <div className="relative mx-auto aspect-[3/4] w-32 overflow-hidden rounded-[50%/42%] sm:w-36 lg:hidden">
                        <StaticGlow />
                        <TreatmentSpecimen
                          id={treatment.id}
                          className="relative h-full w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div aria-hidden className="hidden lg:col-span-4 lg:col-start-9 lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[50%/42%] shadow-porcelain">
            <StaticGlow />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={transition}
              >
                <TreatmentSpecimen
                  id={active ?? ""}
                  className="h-full w-full"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-5 text-center text-caption text-muted">
            {current?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
