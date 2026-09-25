"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { clinic } from "@/content/clinic";
import { cn } from "@/lib/cn";
import { DEFAULT_SHADE, SHADES } from "@/lib/shades";
import { ShadeArch } from "./shade-arch";

export function ShadeGuide() {
  const [selected, setSelected] = useState(DEFAULT_SHADE);
  const shade = SHADES.find((s) => s.code === selected) ?? SHADES[0];
  const { shadeGuide } = clinic;

  return (
    <section
      id="escala"
      aria-labelledby="escala-titulo"
      className="bg-surface py-24 lg:py-36"
    >
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h2
            id="escala-titulo"
            className="text-balance font-display text-heading font-light"
          >
            {shadeGuide.title}
          </h2>
          <p className="mt-6 max-w-[46ch] text-supporting text-foreground/80">
            {shadeGuide.body}
          </p>
          <div className="mt-10 border-t border-foreground/15 pt-6">
            <p className="font-mono text-[1.75rem] leading-none">
              {shade.code}
            </p>
            <p
              aria-live="polite"
              className="mt-3 min-h-[3lh] max-w-[40ch] text-[0.9375rem] text-foreground/80"
            >
              {shade.note}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 lg:self-center">
          <ShadeArch color={shade.hex} />

          {/* Native radios: arrows, Tab and screen readers work without extra code. */}
          <fieldset className="mt-10 min-w-0">
            <legend className="sr-only">Escolha um tom da escala</legend>
            <div className="flex justify-center gap-2 sm:gap-3">
              {SHADES.map((s) => {
                const checked = s.code === selected;
                return (
                  <label
                    key={s.code}
                    className={cn(
                      "flex w-12 cursor-pointer flex-col items-center gap-2 rounded-sm pt-2 pb-1 transition-transform duration-(--duration-ui) ease-porcelain has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent sm:w-14",
                      checked ? "-translate-y-2" : "hover:-translate-y-1",
                    )}
                  >
                    <input
                      type="radio"
                      name="tom"
                      value={s.code}
                      checked={checked}
                      onChange={() => setSelected(s.code)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "font-mono text-[0.75rem]",
                        checked ? "text-accent" : "text-muted",
                      )}
                    >
                      {s.code}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-16 w-8 rounded-[50%/40%] border sm:h-20 sm:w-10",
                        checked
                          ? "border-accent ring-2 ring-accent/30 ring-offset-2 ring-offset-surface"
                          : "border-foreground/15",
                      )}
                      style={{ backgroundColor: s.hex }}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-8 text-center text-caption text-muted">
            {shadeGuide.caption}
          </p>
        </div>
      </Container>
    </section>
  );
}
