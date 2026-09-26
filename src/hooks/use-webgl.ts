"use client";

import { useEffect, useState } from "react";

/** null until checked on the client, then whether a WebGL context can be created. */
export function useWebGL(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setSupported(
        Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")),
      );
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
