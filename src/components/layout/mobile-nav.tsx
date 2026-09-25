"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { clinic } from "@/content/clinic";
import { bookingHref } from "@/lib/contact";
import { DURATION, EASE_PORCELAIN } from "@/lib/motion";
import { NAV_ITEMS } from "./nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative z-50 inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2 text-[0.9375rem]"
      >
        {open ? "Fechar" : "Menu"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: DURATION.ui, ease: EASE_PORCELAIN }}
            className="fixed inset-0 z-40 flex flex-col bg-background px-5 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
          >
            <nav aria-label="Menu">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item, index) => (
                  <li key={item.href} className="border-b border-border">
                    <a
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={close}
                      className="block py-4 font-display text-[2rem] font-light leading-tight"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ButtonLink
              href={bookingHref(clinic.whatsapp)}
              onClick={close}
              className="mt-auto w-full"
            >
              Agendar avaliação
            </ButtonLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
