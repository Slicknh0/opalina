"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { clinic } from "@/content/clinic";
import { cn } from "@/lib/cn";
import { bookingHref } from "@/lib/contact";
import { MobileNav } from "./mobile-nav";
import { NAV_ITEMS } from "./nav-items";

export function Header() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setCompact(y > 24));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-(--duration-ui) ease-porcelain",
        compact
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-(--container-page) items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
        <a
          href="#conteudo"
          className="font-display text-[1.625rem] font-light leading-none tracking-[-0.02em]"
        >
          {clinic.name}
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.9375rem]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-foreground/75 transition-colors duration-(--duration-micro) hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink
            href={bookingHref(clinic.whatsapp)}
            className="hidden min-h-11 px-5 sm:inline-flex"
          >
            Agendar avaliação
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
