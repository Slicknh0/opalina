const round2 = (n: number) => Math.round(n * 100) / 100;

/** ffmpeg args that sample exactly `count` frames evenly across [start, end]. */
export function frameExtractArgs(
  input: string,
  outDir: string,
  o: { start: number; end: number; count: number; width: number },
): string[] {
  const fps = round2(o.count / (o.end - o.start));
  return [
    "-y",
    "-ss",
    String(o.start),
    "-to",
    String(o.end),
    "-i",
    input,
    "-vf",
    `fps=${fps},scale=${o.width}:-2:flags=lanczos`,
    "-frames:v",
    String(o.count),
    "-c:v",
    "libwebp",
    "-quality",
    "80",
    `${outDir}/%03d.webp`,
  ];
}

export function stillArgs(
  input: string,
  output: string,
  width: number,
): string[] {
  return [
    "-y",
    "-i",
    input,
    "-vf",
    `scale=${width}:-2:flags=lanczos`,
    "-c:v",
    "libwebp",
    "-quality",
    "82",
    output,
  ];
}

/** Throws naming every missing raw asset, so a partial set never ships. */
export function requireInputs(
  files: string[],
  exists: (f: string) => boolean,
): void {
  const missing = files.filter((f) => !exists(f));
  if (missing.length) {
    throw new Error(`Missing raw assets: ${missing.join(", ")}`);
  }
}
