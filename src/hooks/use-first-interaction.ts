"use client";

import { useEffect, useState } from "react";

const INTERACTIONS = [
  "pointermove",
  "pointerdown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

/**
 * True once the visitor has interacted with the page. Heavy enhancements
 * (WebGL, frame sequences) wait for it so they never compete with first load.
 */
export function useFirstInteraction(): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const arm = () => setArmed(true);
    for (const type of INTERACTIONS) {
      window.addEventListener(type, arm, { once: true, passive: true });
    }
    return () => {
      for (const type of INTERACTIONS) window.removeEventListener(type, arm);
    };
  }, []);
  return armed;
}
