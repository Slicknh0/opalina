"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useState } from "react";
import { clinic } from "@/content/clinic";
import { bookingHref, phoneHref } from "@/lib/contact";
import { DURATION, EASE_PORCELAIN } from "@/lib/motion";

/** Thumb-reach booking actions on small screens, shown once the hero is scrolled past. */
export function MobileActionBar() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  useMotionValueEvent(scrollY, "change", (y) =>
    setVisible(y > window.innerHeight * 0.7),
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: DURATION.ui, ease: EASE_PORCELAIN }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
          <div className="grid grid-cols-2 gap-3">
            <a
              href={bookingHref(clinic.whatsapp)}
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary text-[0.875rem] font-medium whitespace-nowrap sm:text-[0.9375rem] text-primary-foreground"
            >
              Agendar avaliação
            </a>
            <a
              href={phoneHref(clinic.phone)}
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-foreground/25 text-[0.875rem] font-medium whitespace-nowrap sm:text-[0.9375rem]"
            >
              Ligar
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
