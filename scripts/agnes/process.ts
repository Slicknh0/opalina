/**
 * Turns the raw Agnes outputs in art/raw/ into the web assets under public/.
 * Usage: FFMPEG_PATH=<ffmpeg.exe> node scripts/agnes/process.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { frameExtractArgs, requireInputs, stillArgs } from "./process-args.ts";

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
// Artefact-free range of the rotation video, chosen in the visual gate:
// after ~1.0 s a spurious root tip appears.
const TURN_RANGE = { start: 0, end: 1 };
// Native video resolution is 640 px; frames are never upscaled.
const FRAME_SETS = [
  { dir: "desktop", count: 24, width: 640 },
  { dir: "mobile", count: 12, width: 480 },
] as const;
const TREATMENTS = [
  "lentes",
  "facetas",
  "clareamento",
  "alinhadores",
  "gengiva",
] as const;

const run = (args: string[]) =>
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });

requireInputs(
  [
    "art/raw/tooth-turn.mp4",
    "art/raw/tooth-k1.png",
    "art/raw/tooth-cutaway.png",
    "art/raw/tooth-implant.png",
    ...TREATMENTS.map((t) => `art/raw/treatment-${t}.png`),
  ],
  existsSync,
);

for (const set of FRAME_SETS) {
  const out = `public/tooth/frames/${set.dir}`;
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  run(
    frameExtractArgs("art/raw/tooth-turn.mp4", out, { ...TURN_RANGE, ...set }),
  );
  const made = readdirSync(out).length;
  if (made !== set.count) {
    throw new Error(`${set.dir}: expected ${set.count} frames, got ${made}`);
  }
}

mkdirSync("public/tooth", { recursive: true });
for (const still of ["k1", "cutaway", "implant"]) {
  for (const w of [640, 1024]) {
    run(
      stillArgs(
        `art/raw/tooth-${still}.png`,
        `public/tooth/${still}-${w}.webp`,
        w,
      ),
    );
  }
}

mkdirSync("public/treatments", { recursive: true });
for (const t of TREATMENTS) {
  for (const w of [640, 1024]) {
    run(
      stillArgs(
        `art/raw/treatment-${t}.png`,
        `public/treatments/${t}-${w}.webp`,
        w,
      ),
    );
  }
}

console.log("assets processed");
