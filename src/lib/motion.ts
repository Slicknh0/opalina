/** Motion tokens for JS animations. Mirrors the CSS custom properties in globals.css. */
export const EASE_PORCELAIN = [0.22, 1, 0.36, 1] as const;
export const EASE_SOFT = [0.65, 0, 0.35, 1] as const;

/** Seconds (Motion) — keep in sync with --duration-* in globals.css. */
export const DURATION = {
  micro: 0.16,
  ui: 0.28,
  reveal: 0.6,
  hero: 1,
} as const;
