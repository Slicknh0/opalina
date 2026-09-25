"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type FrameSet, frameUrl } from "@/lib/scene";

const IN_FLIGHT = 4;

/** Every 4th frame first, so a coarse turn is scrubbable early; then the rest. */
function loadOrder(count: number): number[] {
  const all = Array.from({ length: count }, (_, i) => i);
  return [...all.filter((i) => i % 4 === 0), ...all.filter((i) => i % 4 !== 0)];
}

/**
 * Fetches and decodes a frame set once `enabled`. Exposes the decoded bitmaps
 * and the set of loaded indices (updated at most once per animation frame).
 * Changing the set aborts the previous load and releases its bitmaps.
 */
export function useFrameLoader(set: FrameSet, enabled: boolean) {
  const bitmaps = useRef(new Map<number, ImageBitmap>());
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const map = new Map<number, ImageBitmap>();
    bitmaps.current = map;
    setLoaded(new Set());

    const order = loadOrder(set.count);
    let next = 0;
    let raf = 0;
    const flush = () => {
      raf = 0;
      setLoaded(new Set(map.keys()));
    };

    const worker = async () => {
      while (next < order.length && !controller.signal.aborted) {
        const index = order[next++];
        try {
          const res = await fetch(frameUrl(set, index), {
            signal: controller.signal,
          });
          const bitmap = await createImageBitmap(await res.blob());
          if (controller.signal.aborted) {
            bitmap.close();
            return;
          }
          map.set(index, bitmap);
          if (!raf) raf = requestAnimationFrame(flush);
        } catch {
          // Aborted or failed frame: the canvas falls back to the nearest loaded one.
        }
      }
    };
    for (let i = 0; i < IN_FLIGHT; i++) void worker();

    return () => {
      controller.abort();
      cancelAnimationFrame(raf);
      for (const bitmap of map.values()) bitmap.close();
    };
  }, [set, enabled]);

  const getBitmap = useCallback(
    (index: number) => bitmaps.current.get(index),
    [],
  );
  return { getBitmap, loaded };
}
