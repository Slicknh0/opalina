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
  const panelRef = useRef<HTMLDivElement>(null);
  // Following a link moves the reader to a section; only closing returns focus.
  const returnFocus = useRef(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    returnFocus.current = true;
    firstLinkRef.current?.focus();

    // Everything outside the header is inert while the sheet covers it.
    const header = triggerRef.current?.closest("header");
    const outside = [...document.body.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== header,
    );
    for (const el of outside) el.inert = true;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      // Keep Tab cycling between the close button and the sheet.
      const focusables = [
        triggerRef.current,
        ...(panelRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []),
      ].filter((el): el is HTMLElement => el !== null);
      const index = focusables.indexOf(document.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const next =
        focusables[(index + step + focusables.length) % focusables.length];
      event.preventDefault();
      next?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      for (const el of outside) el.inert = false;
      window.removeEventListener("keydown", onKey);
      if (returnFocus.current) triggerRef.current?.focus();
    };
  }, [open]);

  const followLink = () => {
    returnFocus.current = false;
    setOpen(false);
  };

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
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
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
                      onClick={followLink}
                      className="block py-4 font-display text-[2rem] font-light leading-tight"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ButtonLink
              href={bookingHref(clinic.whatsappLink)}
              onClick={followLink}
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
