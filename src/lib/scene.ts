/** Scroll timing of the tooth scene, as fractions of its pinned scroll length. */
export const SCENE = { turnEnd: 0.35, layersEnd: 0.7, wipeSpan: 0.06 } as const;

export type Beat = "turn" | "layers" | "implant";
export type FrameSet = {
  dir: "desktop" | "mobile";
  count: number;
  width: number;
};

export const FRAME_SETS = {
  desktop: { dir: "desktop", count: 48, width: 960 },
  mobile: { dir: "mobile", count: 24, width: 640 },
} as const satisfies Record<string, FrameSet>;

const clamp01 = (n: number) =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;

/** Frame index for the turn beat; holds the last frame once the turn is over. */
export function frameForProgress(progress: number, frameCount: number): number {
  const turn = clamp01(clamp01(progress) / SCENE.turnEnd);
  return Math.round(turn * (frameCount - 1));
}

export function beatForProgress(progress: number): Beat {
  const p = clamp01(progress);
  if (p < SCENE.turnEnd) return "turn";
  if (p < SCENE.layersEnd) return "layers";
  return "implant";
}

/** 0 → 1 over SCENE.wipeSpan after `start`. */
export function wipeProgress(progress: number, start: number): number {
  return clamp01((clamp01(progress) - start) / SCENE.wipeSpan);
}

export function frameSetFor(viewportWidth: number): FrameSet {
  return viewportWidth < 768 ? FRAME_SETS.mobile : FRAME_SETS.desktop;
}

export function frameUrl(set: FrameSet, index: number): string {
  return `/tooth/frames/${set.dir}/${String(index + 1).padStart(3, "0")}.webp`;
}

/** Nearest loaded frame at or below the target; null means "show the poster". */
export function pickDrawableFrame(
  target: number,
  loaded: ReadonlySet<number>,
): number | null {
  for (let i = target; i >= 0; i--) if (loaded.has(i)) return i;
  return null;
}
