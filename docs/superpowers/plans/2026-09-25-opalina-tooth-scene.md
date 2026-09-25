# Opalina Tooth Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero and principle sections with a pinned, scroll-driven 3D tooth scene built from Agnes-generated assets, and replace the treatment SVG specimens with Agnes renders.

**Architecture:** An offline asset pipeline (`scripts/agnes/`) turns a versioned prompt manifest into raw Agnes outputs (gitignored), then ffmpeg turns them into committed WebP stills and frame sequences under `public/`. The site stays fully static: a client `ToothScene` reads scroll progress with Motion, draws the rotation frames on a canvas, wipes between stills with Motion masks, and draws layer labels with Anime.js. Pure mapping logic (progress → frame/beat/wipe) lives in `src/lib/scene.ts` with unit tests.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · motion 13 · animejs 4 · @shadergradient/react · Node 24 (native TS type stripping for scripts) · ffmpeg 9 (Gyan build via winget) · Agnes API (`agnes-image-2.1-flash`, `agnes-video-v2.0`) · Vitest · Playwright.

**Spec:** `docs/superpowers/specs/2026-09-25-opalina-tooth-scene-design.md`

## Global Constraints

- The Agnes key lives only in `.env.local` (`AGNES_API_KEY`); no committed file, log line or shipped asset may contain it. `git grep -n "sk-"` must stay empty.
- No runtime calls to Agnes; the site stays static. CSP unchanged (`img-src 'self' data: blob:`).
- Agnes API: base `https://apihub.agnes-ai.com`; images `POST /v1/images/generations` (`model`, `prompt`, `size`, optional `seed`, edits via `extra_body: { image: [url] }`); video `POST /v1/videos` (`model: "agnes-video-v2.0"`, `width`, `height`, `num_frames` = 8n+1 ≤ 441, `frame_rate` 1–60, keyframes via `extra_body: { image: [urlA, urlB], mode: "keyframes" }`); poll `GET /agnesapi?video_id=<id>` (ids starting `task_` poll `GET /v1/videos/<id>`).
- ffmpeg path: `C:\Users\likcv\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe` (scripts read `FFMPEG_PATH` env, falling back to `ffmpeg` on PATH).
- Raw outputs in `art/raw/` (gitignored). Final assets in `public/tooth/` and `public/treatments/` (committed).
- No `next/image` (sharp build blocked); `<img srcset>` with pre-generated widths 640/1024/1600.
- Scene timing: turn 0–0.35, layers 0.35–0.70, implant 0.70–1. Desktop 48 frames @960px, mobile 24 frames @640px; mobile = viewport width < 768px.
- Library ownership: canvas frames driven from Motion `useScroll`; Motion owns masks, crossfades, beat copy; Anime.js owns only the leader-line SVG + label reveal; never both on the same element/property.
- Reduced motion or no JS: no pinning, no canvas, three stacked stills with their copy.
- Treatment renders carry the caption "Ilustração 3D"; no people, patients or before/after.
- Copy PT-BR; identifiers and comments English; conventional commits; **no `Co-Authored-By` trailer** (user rule).
- Performance floor: Lighthouse mobile Performance ≥ 80, CLS 0.

## Review Focus

- Frames not loaded yet when the visitor scrolls fast → canvas keeps showing the poster (never blank, never an earlier-beat still flashing). (Task 4 unit test on `pickDrawableFrame`.)
- Visitor lands mid-page (reload scrolled / anchor link `#tratamentos`) → scene renders the beat for the current progress, not beat 1. (Task 4 e2e.)
- Window resized across 768px → frame set switches without a broken canvas size or a stale set. (Task 4 unit test on `frameSetFor` + e2e at two widths.)
- Keyboard user tabbing through the pinned scene → CTAs reachable, focus visible, page scrolls to them. (Task 6 e2e.)
- A generated asset missing or a failed generation mid-run → `generate` resumes from what exists; `process` fails loudly naming the missing file instead of shipping partial frames. (Tasks 2–3 unit tests.)

---

### Task 1: Scene mapping logic and asset manifest (TDD)

**Files:**
- Create: `src/lib/scene.ts`, `src/lib/scene.test.ts`
- Create: `scripts/agnes/manifest.ts`, `scripts/agnes/manifest.test.ts`, `scripts/agnes/assets.json`
- Modify: `vitest.config.ts` (include `scripts/**/*.test.ts`), `tsconfig.json` (`"allowImportingTsExtensions": true`), `.gitignore` (`/art/raw/`)

**Interfaces — Produces:**
- `scene.ts`: `SCENE = { turnEnd: 0.35, layersEnd: 0.7, wipeSpan: 0.06 } as const`; `type Beat = "turn" | "layers" | "implant"`; `frameForProgress(progress: number, frameCount: number): number`; `beatForProgress(progress: number): Beat`; `wipeProgress(progress: number, start: number): number` (0..1); `type FrameSet = { dir: "desktop" | "mobile"; count: number; width: number }`; `FRAME_SETS: Record<"desktop"|"mobile", FrameSet>`; `frameSetFor(viewportWidth: number): FrameSet`; `frameUrl(set: FrameSet, index: number): string` → `/tooth/frames/<dir>/<NNN>.webp` (3-digit, 1-based); `pickDrawableFrame(target: number, loaded: ReadonlySet<number>): number | null` (nearest loaded frame at or below target, else null → poster).
- `manifest.ts`: `type AssetSpec = { id: string; kind: "image" | "image-edit" | "keyframes-video"; prompt: string; inputs?: string[]; size?: string; seed?: number; width?: number; height?: number; numFrames?: number; frameRate?: number }`; `type Manifest = { styleSuffix: string; assets: AssetSpec[] }`; `validateManifest(m: Manifest): string[]` (empty = valid); `fullPrompt(m: Manifest, a: AssetSpec): string`.

- [ ] **Step 1: config.** `vitest.config.ts` → `include: ["src/**/*.test.ts", "scripts/**/*.test.ts"]`; tsconfig add `"allowImportingTsExtensions": true`; `.gitignore` add `/art/raw/`.
- [ ] **Step 2: failing tests** `src/lib/scene.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  beatForProgress,
  FRAME_SETS,
  frameForProgress,
  frameSetFor,
  frameUrl,
  pickDrawableFrame,
  wipeProgress,
} from "./scene";

describe("frameForProgress", () => {
  it("maps the turn beat across all frames", () => {
    expect(frameForProgress(0, 48)).toBe(0);
    expect(frameForProgress(0.175, 48)).toBe(24);
    expect(frameForProgress(0.35, 48)).toBe(47);
  });
  it("holds the last frame after the turn and clamps bad input", () => {
    expect(frameForProgress(0.9, 48)).toBe(47);
    expect(frameForProgress(-1, 48)).toBe(0);
    expect(frameForProgress(Number.NaN, 48)).toBe(0);
  });
});

describe("beatForProgress", () => {
  it.each([
    [0, "turn"],
    [0.349, "turn"],
    [0.35, "layers"],
    [0.69, "layers"],
    [0.7, "implant"],
    [1, "implant"],
  ] as const)("%s → %s", (p, beat) => {
    expect(beatForProgress(p)).toBe(beat);
  });
});

describe("wipeProgress", () => {
  it("ramps from 0 to 1 over the wipe span after its start", () => {
    expect(wipeProgress(0.3, 0.35)).toBe(0);
    expect(wipeProgress(0.38, 0.35)).toBeCloseTo(0.5);
    expect(wipeProgress(0.5, 0.35)).toBe(1);
  });
});

describe("frame sets", () => {
  it("uses the mobile set below 768px", () => {
    expect(frameSetFor(390)).toBe(FRAME_SETS.mobile);
    expect(frameSetFor(767)).toBe(FRAME_SETS.mobile);
    expect(frameSetFor(768)).toBe(FRAME_SETS.desktop);
  });
  it("builds 1-based, zero-padded urls", () => {
    expect(frameUrl(FRAME_SETS.desktop, 0)).toBe("/tooth/frames/desktop/001.webp");
    expect(frameUrl(FRAME_SETS.mobile, 23)).toBe("/tooth/frames/mobile/024.webp");
  });
});

describe("pickDrawableFrame", () => {
  it("returns null (poster) until something at or below the target is loaded", () => {
    expect(pickDrawableFrame(10, new Set())).toBeNull();
    expect(pickDrawableFrame(10, new Set([12, 30]))).toBeNull();
  });
  it("returns the nearest loaded frame at or below the target", () => {
    expect(pickDrawableFrame(10, new Set([0, 4, 9, 12]))).toBe(9);
    expect(pickDrawableFrame(10, new Set([10]))).toBe(10);
  });
});
```

`scripts/agnes/manifest.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fullPrompt, type Manifest, validateManifest } from "./manifest.ts";
import manifest from "./assets.json" with { type: "json" };

const base: Manifest = {
  styleSuffix: "studio light",
  assets: [
    { id: "a", kind: "image", prompt: "tooth", size: "1024x1024" },
    { id: "b", kind: "image-edit", prompt: "turn", inputs: ["a"], size: "1024x1024" },
    { id: "v", kind: "keyframes-video", prompt: "spin", inputs: ["a", "b"], width: 768, height: 768, numFrames: 97, frameRate: 24 },
  ],
};

describe("validateManifest", () => {
  it("accepts a well-formed manifest", () => {
    expect(validateManifest(base)).toEqual([]);
  });
  it("accepts the real assets.json", () => {
    expect(validateManifest(manifest as Manifest)).toEqual([]);
  });
  it("rejects duplicate ids and forward or unknown inputs", () => {
    const m: Manifest = {
      ...base,
      assets: [
        { id: "a", kind: "image", prompt: "x" },
        { id: "a", kind: "image", prompt: "y" },
        { id: "e", kind: "image-edit", prompt: "z", inputs: ["later"] },
        { id: "later", kind: "image", prompt: "w" },
      ],
    };
    const errors = validateManifest(m).join("\n");
    expect(errors).toMatch(/duplicate id "a"/);
    expect(errors).toMatch(/"e".*"later"/);
  });
  it("rejects bad video frame counts and input arity", () => {
    const m: Manifest = {
      ...base,
      assets: [
        { id: "a", kind: "image", prompt: "x" },
        { id: "e", kind: "image-edit", prompt: "z", inputs: [] },
        { id: "v", kind: "keyframes-video", prompt: "s", inputs: ["a"], numFrames: 100 },
      ],
    };
    const errors = validateManifest(m).join("\n");
    expect(errors).toMatch(/"e".*exactly one input/);
    expect(errors).toMatch(/"v".*at least two inputs/);
    expect(errors).toMatch(/"v".*8n\+1/);
  });
});

describe("fullPrompt", () => {
  it("appends the shared style suffix", () => {
    expect(fullPrompt(base, base.assets[0])).toBe("tooth, studio light");
  });
});
```

- [ ] **Step 3:** `pnpm test` → FAIL (modules missing).
- [ ] **Step 4:** implement `src/lib/scene.ts`:

```ts
export const SCENE = { turnEnd: 0.35, layersEnd: 0.7, wipeSpan: 0.06 } as const;

export type Beat = "turn" | "layers" | "implant";
export type FrameSet = { dir: "desktop" | "mobile"; count: number; width: number };

export const FRAME_SETS = {
  desktop: { dir: "desktop", count: 48, width: 960 },
  mobile: { dir: "mobile", count: 24, width: 640 },
} as const satisfies Record<string, FrameSet>;

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

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
export function pickDrawableFrame(target: number, loaded: ReadonlySet<number>): number | null {
  for (let i = target; i >= 0; i--) if (loaded.has(i)) return i;
  return null;
}
```

`scripts/agnes/manifest.ts`:

```ts
export type AssetSpec = {
  id: string;
  kind: "image" | "image-edit" | "keyframes-video";
  prompt: string;
  inputs?: string[];
  size?: string;
  seed?: number;
  width?: number;
  height?: number;
  numFrames?: number;
  frameRate?: number;
};
export type Manifest = { styleSuffix: string; assets: AssetSpec[] };

export function validateManifest(m: Manifest): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const a of m.assets) {
    if (seen.has(a.id)) errors.push(`duplicate id "${a.id}"`);
    for (const input of a.inputs ?? []) {
      if (!seen.has(input)) errors.push(`"${a.id}" uses "${input}" before it is generated`);
    }
    const inputs = a.inputs?.length ?? 0;
    if (a.kind === "image-edit" && inputs !== 1) errors.push(`"${a.id}" needs exactly one input`);
    if (a.kind === "keyframes-video") {
      if (inputs < 2) errors.push(`"${a.id}" needs at least two inputs`);
      const n = a.numFrames ?? 121;
      if (n > 441 || (n - 1) % 8 !== 0) errors.push(`"${a.id}" numFrames must be 8n+1 and ≤ 441`);
    }
    if (a.size && !/^\d+x\d+$/.test(a.size)) errors.push(`"${a.id}" size must look like 1024x1024`);
    seen.add(a.id);
  }
  return errors;
}

export function fullPrompt(m: Manifest, a: AssetSpec): string {
  return `${a.prompt}, ${m.styleSuffix}`;
}
```

`scripts/agnes/assets.json` (prompts in English; all stills 1024x1024; fixed seed 7 on the anchor):

```json
{
  "styleSuffix": "photorealistic 3D product render, translucent frosted glass and pearlescent porcelain materials, soft diffused studio light from upper left, subtle internal refraction, seamless plain cool porcelain white background #F5F5F2 with no vignette, centered, high-end aesthetic dental clinic campaign, minimal, no text, no people, no ground shadow",
  "assets": [
    { "id": "tooth-k1", "kind": "image", "prompt": "a single human molar tooth, pearlescent porcelain crown and frosted glass roots, three-quarter view, floating", "size": "1024x1024", "seed": 7 },
    { "id": "tooth-k2", "kind": "image-edit", "inputs": ["tooth-k1"], "prompt": "the exact same molar tooth rotated 45 degrees clockwise around its vertical axis, same material, same lighting, same size and position, same background", "size": "1024x1024" },
    { "id": "tooth-cutaway", "kind": "image-edit", "inputs": ["tooth-k1"], "prompt": "the exact same molar tooth cut cleanly in half vertically to show its inner layers: a thin pearlescent enamel shell, warm ivory dentine beneath it, and a soft rose pulp chamber in the core running into the roots, same pose, same lighting, same background", "size": "1024x1024" },
    { "id": "tooth-implant", "kind": "image-edit", "inputs": ["tooth-k1"], "prompt": "in the same pose and position, a dental implant replacing the tooth: a pearlescent porcelain crown on top, a small ceramic abutment and a satin titanium screw implant below, slightly separated in an elegant exploded view, same lighting, same background", "size": "1024x1024" },
    { "id": "treatment-lentes", "kind": "image", "prompt": "a frosted glass front incisor tooth with an ultra thin pearlescent porcelain veneer shell floating just in front of it, three-quarter view", "size": "1024x1024" },
    { "id": "treatment-facetas", "kind": "image", "prompt": "a frosted glass front incisor tooth with a thicker glossy porcelain facet fitting onto its front surface, three-quarter view", "size": "1024x1024" },
    { "id": "treatment-clareamento", "kind": "image", "prompt": "three glass front incisor teeth side by side, shading from a warm ivory tone on the left to a bright natural white on the right", "size": "1024x1024" },
    { "id": "treatment-alinhadores", "kind": "image", "prompt": "a crystal clear dental aligner tray floating just above a neat row of frosted glass teeth", "size": "1024x1024" },
    { "id": "treatment-gengiva", "kind": "image", "prompt": "two frosted glass front teeth set in a soft matte pale pink abstract gum contour with a smooth, even curve, sculptural and minimal", "size": "1024x1024" },
    { "id": "tooth-turn", "kind": "keyframes-video", "inputs": ["tooth-k1", "tooth-k2"], "prompt": "the glass molar tooth rotates slowly and smoothly on its vertical axis from the first frame to the last frame, static camera, the tooth keeps exactly the same shape, root count and material, background unchanged", "width": 768, "height": 768, "numFrames": 97, "frameRate": 24 }
  ]
}
```

- [ ] **Step 5:** `pnpm test` → all PASS; `pnpm typecheck && pnpm check` clean.
- [ ] **Step 6:** commit `feat: add scene mapping logic and Agnes asset manifest`.

### Task 2: Generation script and generated raw assets

**Files:**
- Create: `scripts/agnes/generate.ts`, `scripts/agnes/generate.test.ts`, `scripts/agnes/agnes.ts`
- Modify: `package.json` (script `"assets:generate": "node scripts/agnes/generate.ts"`)
- Output (gitignored): `art/raw/<id>.png`, `art/raw/<id>.mp4`, `art/raw/index.json` (`{ [id]: { url, file } }`)

**Interfaces — Consumes:** `validateManifest`, `fullPrompt`, `AssetSpec`, `Manifest` (Task 1). **Produces:** `buildRequest(asset: AssetSpec, prompt: string, inputUrls: string[]): { path: string; body: Record<string, unknown> }`; `pendingAssets(m: Manifest, done: Record<string, unknown>, only?: string): AssetSpec[]`.

- [ ] **Step 1: failing test** `scripts/agnes/generate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildRequest, pendingAssets } from "./agnes.ts";
import type { Manifest } from "./manifest.ts";

const m: Manifest = {
  styleSuffix: "s",
  assets: [
    { id: "a", kind: "image", prompt: "p", size: "1024x1024", seed: 7 },
    { id: "b", kind: "image-edit", prompt: "p", inputs: ["a"], size: "1024x1024" },
    { id: "v", kind: "keyframes-video", prompt: "p", inputs: ["a", "b"], width: 768, height: 768, numFrames: 97, frameRate: 24 },
  ],
};

describe("buildRequest", () => {
  it("builds a text-to-image request", () => {
    expect(buildRequest(m.assets[0], "p, s", [])).toEqual({
      path: "/v1/images/generations",
      body: { model: "agnes-image-2.1-flash", prompt: "p, s", size: "1024x1024", seed: 7 },
    });
  });
  it("passes edit inputs in extra_body.image", () => {
    expect(buildRequest(m.assets[1], "p, s", ["https://x/a.png"]).body).toMatchObject({
      extra_body: { image: ["https://x/a.png"] },
    });
  });
  it("builds a keyframes video request", () => {
    expect(buildRequest(m.assets[2], "p, s", ["u1", "u2"])).toEqual({
      path: "/v1/videos",
      body: {
        model: "agnes-video-v2.0",
        prompt: "p, s",
        width: 768,
        height: 768,
        num_frames: 97,
        frame_rate: 24,
        extra_body: { image: ["u1", "u2"], mode: "keyframes" },
      },
    });
  });
});

describe("pendingAssets", () => {
  it("skips assets already generated (resume)", () => {
    expect(pendingAssets(m, { a: {} }).map((a) => a.id)).toEqual(["b", "v"]);
  });
  it("regenerates only the requested asset", () => {
    expect(pendingAssets(m, { a: {}, b: {}, v: {} }, "b").map((a) => a.id)).toEqual(["b"]);
  });
});
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** `scripts/agnes/agnes.ts` (pure):

```ts
import type { AssetSpec, Manifest } from "./manifest.ts";

export function buildRequest(asset: AssetSpec, prompt: string, inputUrls: string[]) {
  if (asset.kind === "keyframes-video") {
    return {
      path: "/v1/videos",
      body: {
        model: "agnes-video-v2.0",
        prompt,
        width: asset.width ?? 768,
        height: asset.height ?? 768,
        num_frames: asset.numFrames ?? 97,
        frame_rate: asset.frameRate ?? 24,
        extra_body: { image: inputUrls, mode: "keyframes" },
      } as Record<string, unknown>,
    };
  }
  const body: Record<string, unknown> = { model: "agnes-image-2.1-flash", prompt };
  if (asset.size) body.size = asset.size;
  if (asset.seed !== undefined) body.seed = asset.seed;
  if (asset.kind === "image-edit") body.extra_body = { image: inputUrls };
  return { path: "/v1/images/generations", body };
}

export function pendingAssets(m: Manifest, done: Record<string, unknown>, only?: string): AssetSpec[] {
  if (only) return m.assets.filter((a) => a.id === only);
  return m.assets.filter((a) => !(a.id in done));
}
```

- [ ] **Step 4:** run → PASS.
- [ ] **Step 5:** `scripts/agnes/generate.ts` (I/O shell around the pure functions):

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildRequest, pendingAssets } from "./agnes.ts";
import { fullPrompt, type Manifest, validateManifest } from "./manifest.ts";

const API = "https://apihub.agnes-ai.com";
const RAW = "art/raw";
const INDEX = `${RAW}/index.json`;

process.loadEnvFile(".env.local");
const KEY = process.env.AGNES_API_KEY;
if (!KEY) throw new Error("AGNES_API_KEY missing in .env.local");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const dryRun = args.includes("--dry-run");

const manifest = JSON.parse(readFileSync("scripts/agnes/assets.json", "utf8")) as Manifest;
const errors = validateManifest(manifest);
if (errors.length) throw new Error(`Invalid manifest:\n${errors.join("\n")}`);

mkdirSync(RAW, { recursive: true });
const index: Record<string, { url: string; file: string }> = existsSync(INDEX)
  ? JSON.parse(readFileSync(INDEX, "utf8"))
  : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(method: string, path: string, body?: unknown): Promise<Record<string, any>> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API + path, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 && attempt <= 6) {
      console.log(`  429, waiting 65s (attempt ${attempt})`);
      await sleep(65_000);
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
    return JSON.parse(text);
  }
}

async function download(url: string, file: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

for (const asset of pendingAssets(manifest, index, only)) {
  const inputs = (asset.inputs ?? []).map((id) => {
    const url = index[id]?.url;
    if (!url) throw new Error(`"${asset.id}" needs "${id}", which is not generated yet`);
    return url;
  });
  const { path, body } = buildRequest(asset, fullPrompt(manifest, asset), inputs);
  console.log(`→ ${asset.id} (${asset.kind})`);
  if (dryRun) continue;

  if (asset.kind === "keyframes-video") {
    const created = await call("POST", path, body);
    const id = String(created.video_id ?? created.id ?? created.task_id);
    const pollPath = id.startsWith("task_") ? `/v1/videos/${id}` : `/agnesapi?video_id=${encodeURIComponent(id)}`;
    for (let i = 0; ; i++) {
      await sleep(10_000);
      const r = await call("GET", pollPath);
      const status = String(r.status ?? "").toLowerCase();
      const url = r.metadata?.url ?? r.video_url ?? r.url ?? r.output_url ?? r.result?.video_url;
      if (/fail|error|cancel/.test(status)) throw new Error(`video ${asset.id} failed: ${status}`);
      if (typeof url === "string" && url.startsWith("http")) {
        const file = `${RAW}/${asset.id}.mp4`;
        await download(url, file);
        index[asset.id] = { url, file };
        break;
      }
      if (i > 90) throw new Error(`video ${asset.id} timed out`);
    }
  } else {
    const r = await call("POST", path, body);
    const url = r.data?.[0]?.url;
    if (typeof url !== "string") throw new Error(`image ${asset.id}: no url in response`);
    const file = `${RAW}/${asset.id}.png`;
    await download(url, file);
    index[asset.id] = { url, file };
  }
  writeFileSync(INDEX, JSON.stringify(index, null, 2));
  console.log(`  saved ${index[asset.id].file}`);
}
```

Note: Agnes image URLs are temporary; edits and the video must run in the same session as their inputs, or with `--only <input>` regenerated first.
- [ ] **Step 6:** `pnpm assets:generate --dry-run` → lists 10 assets, no network. Then run for real: `pnpm assets:generate`.
- [ ] **Step 7: visual gate.** Build a contact sheet of the stills (browser page in scratchpad) and of the video (frames at 0.5s intervals, as in the spike). Check: same tooth identity across k1/k2/cutaway/implant; cool background without vignette; no root-count change inside the frame range that will ship. Regenerate any failing asset with `--only <id>` (at most 3 attempts per asset; record in the ledger what changed). Record the clean video time range (e.g. `0.0–3.2s`) for Task 3.
- [ ] **Step 8:** `git grep -n "sk-"` → empty. Commit `feat: add Agnes asset generation script` (scripts only; `art/raw` is gitignored).

### Task 3: Asset processing into web formats

**Files:**
- Create: `scripts/agnes/process.ts`, `scripts/agnes/process-args.ts`, `scripts/agnes/process.test.ts`
- Modify: `package.json` (`"assets:process": "node scripts/agnes/process.ts"`)
- Output (committed): `public/tooth/frames/desktop/001..048.webp`, `public/tooth/frames/mobile/001..024.webp`, `public/tooth/{k1,cutaway,implant}-{640,1024,1600}.webp`, `public/treatments/{lentes,facetas,clareamento,alinhadores,gengiva}-{640,1024}.webp`

**Interfaces — Produces:** `frameExtractArgs(input: string, outDir: string, opts: { start: number; end: number; count: number; width: number }): string[]`; `stillArgs(input: string, output: string, width: number): string[]`; `requireInputs(files: string[], exists: (f: string) => boolean): void` (throws naming every missing file).

- [ ] **Step 1: failing test** `scripts/agnes/process.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { frameExtractArgs, requireInputs, stillArgs } from "./process-args.ts";

describe("frameExtractArgs", () => {
  it("samples exactly `count` frames evenly across the clean range", () => {
    const args = frameExtractArgs("in.mp4", "out", { start: 0, end: 3.2, count: 48, width: 960 });
    expect(args).toEqual([
      "-y", "-ss", "0", "-to", "3.2", "-i", "in.mp4",
      "-vf", "fps=15,scale=960:-2:flags=lanczos",
      "-frames:v", "48", "-c:v", "libwebp", "-quality", "80",
      "out/%03d.webp",
    ]);
  });
});

describe("stillArgs", () => {
  it("scales a still to webp at the given width", () => {
    expect(stillArgs("k1.png", "k1-640.webp", 640)).toEqual([
      "-y", "-i", "k1.png", "-vf", "scale=640:-2:flags=lanczos",
      "-c:v", "libwebp", "-quality", "82", "k1-640.webp",
    ]);
  });
});

describe("requireInputs", () => {
  it("names every missing file", () => {
    expect(() => requireInputs(["a.png", "b.mp4"], (f) => f === "a.png")).toThrow(/b\.mp4/);
  });
  it("passes when all exist", () => {
    expect(() => requireInputs(["a.png"], () => true)).not.toThrow();
  });
});
```

(`fps` = `count / (end - start)` rounded to 2 decimals: 48 / 3.2 = 15.)
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** `scripts/agnes/process-args.ts`:

```ts
const round2 = (n: number) => Math.round(n * 100) / 100;

export function frameExtractArgs(
  input: string,
  outDir: string,
  o: { start: number; end: number; count: number; width: number },
): string[] {
  const fps = round2(o.count / (o.end - o.start));
  return [
    "-y", "-ss", String(o.start), "-to", String(o.end), "-i", input,
    "-vf", `fps=${fps},scale=${o.width}:-2:flags=lanczos`,
    "-frames:v", String(o.count), "-c:v", "libwebp", "-quality", "80",
    `${outDir}/%03d.webp`,
  ];
}

export function stillArgs(input: string, output: string, width: number): string[] {
  return [
    "-y", "-i", input, "-vf", `scale=${width}:-2:flags=lanczos`,
    "-c:v", "libwebp", "-quality", "82", output,
  ];
}

export function requireInputs(files: string[], exists: (f: string) => boolean): void {
  const missing = files.filter((f) => !exists(f));
  if (missing.length) throw new Error(`Missing raw assets: ${missing.join(", ")}`);
}
```

Update the test import to `./process-args.ts` (already written that way).
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5:** `scripts/agnes/process.ts`:

```ts
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { frameExtractArgs, requireInputs, stillArgs } from "./process-args.ts";

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
// Clean, artefact-free range of the rotation video, chosen in Task 2's visual gate.
const TURN_RANGE = { start: 0, end: 3.2 };

const run = (args: string[]) => execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });

requireInputs(
  ["art/raw/tooth-turn.mp4", "art/raw/tooth-k1.png", "art/raw/tooth-cutaway.png", "art/raw/tooth-implant.png",
   ...["lentes", "facetas", "clareamento", "alinhadores", "gengiva"].map((t) => `art/raw/treatment-${t}.png`)],
  existsSync,
);

for (const [dir, count, width] of [["desktop", 48, 960], ["mobile", 24, 640]] as const) {
  const out = `public/tooth/frames/${dir}`;
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  run(frameExtractArgs("art/raw/tooth-turn.mp4", out, { ...TURN_RANGE, count, width }));
  const made = readdirSync(out).length;
  if (made !== count) throw new Error(`${dir}: expected ${count} frames, got ${made}`);
}

mkdirSync("public/tooth", { recursive: true });
for (const still of ["k1", "cutaway", "implant"]) {
  for (const w of [640, 1024, 1600]) run(stillArgs(`art/raw/tooth-${still}.png`, `public/tooth/${still}-${w}.webp`, w));
}
mkdirSync("public/treatments", { recursive: true });
for (const t of ["lentes", "facetas", "clareamento", "alinhadores", "gengiva"]) {
  for (const w of [640, 1024]) run(stillArgs(`art/raw/treatment-${t}.png`, `public/treatments/${t}-${w}.webp`, w));
}
console.log("assets processed");
```

Set `TURN_RANGE` from the Task 2 gate. The 1600 width upscales the 1024 source (acceptable softness only on 2x ≥ 800 CSS px; if it looks soft, drop 1600 and ship 1024 as the largest — ledger it).
- [ ] **Step 6:** `FFMPEG_PATH=<path> pnpm assets:process`; check sizes: desktop frames total ≤ 2.5 MB, mobile ≤ 0.8 MB, k1-1024 ≤ 120 KB (lower `-quality` in `stillArgs`/`frameExtractArgs` if over — update the tests with the value).
- [ ] **Step 7:** commit `feat: process Agnes assets into web frames and stills` (scripts + `public/tooth`, `public/treatments`).

### Task 4: Frame sequence canvas

**Files:**
- Create: `src/components/scene/frame-canvas.tsx`, `src/hooks/use-frame-loader.ts`

**Interfaces — Consumes:** `frameForProgress`, `frameSetFor`, `frameUrl`, `pickDrawableFrame`, `FrameSet` (Task 1). **Produces:** `FrameCanvas({ progress: MotionValue<number>, active: boolean, className? })` — draws the drawable frame for `progress`; renders nothing (lets the poster show) until the first frame is ready; `useFrameLoader(set: FrameSet, enabled: boolean): { bitmaps: Map<number, ImageBitmap>; loaded: ReadonlySet<number> }`.

- [ ] **Step 1:** `use-frame-loader.ts`: when `enabled`, fetch frames in order of priority (every 4th frame first, then the rest) with `fetch` + `createImageBitmap`, max 4 in flight, abort on unmount/`set` change (AbortController), store in a Map, expose `loaded` as a new Set on each batch (throttled to one state update per animation frame).
- [ ] **Step 2:** `frame-canvas.tsx`: canvas sized to its box × `devicePixelRatio` (ResizeObserver); `useMotionValueEvent(progress, "change")` → compute target via `frameForProgress`, pick via `pickDrawableFrame`, draw only when the picked index changes (rAF); `frameSetFor(window.innerWidth)` re-evaluated on resize (debounced 150 ms) — changing set resets loader. Canvas `aria-hidden`, `opacity-0` until first draw.
- [ ] **Step 3:** wire a temporary route-free check: render `FrameCanvas` inside the scene in Task 5 (no standalone commit of dead code). Unit logic is already covered by Task 1; behaviour is covered by Task 8 e2e. Run `pnpm typecheck && pnpm check`.
- [ ] **Step 4:** commit together with Task 5.

### Task 5: Tooth scene (replaces Hero and Principle)

**Files:**
- Create: `src/components/scene/tooth-scene.tsx`, `src/components/scene/scene-stills.tsx`, `src/components/scene/beat-copy.tsx`
- Modify: `src/content/clinic.ts` (add `scene` copy), `src/app/page.tsx` (replace `<Hero />` + `<Principle />` with `<ToothScene />`)
- Delete: `src/components/sections/hero.tsx`, `src/components/sections/principle.tsx`, `src/components/ui/light-sweep-text.tsx` (only used by Principle)

**Interfaces — Consumes:** `FrameCanvas` (Task 4), `wipeProgress`, `beatForProgress`, `SCENE` (Task 1), `HeroTitle`, `ShaderSlot`, `ButtonLink`, `bookingHref`. **Produces:** `clinic.scene = { beats: { turn: { title, body }, layers: { title, body, labels: { enamel, dentine, pulp } }, implant: { title, body } }, alts: { k1, cutaway, implant } }`.

- [ ] **Step 1: content** in `clinic.ts`:

```ts
scene: {
  beats: {
    turn: {
      title: "A luz atravessa o esmalte.",
      body: "Um dente natural não é branco opaco: a borda é translúcida e a luz entra, reflete e volta com profundidade.",
    },
    layers: {
      title: "Naturalidade antes de brancura.",
      body: "Esmalte, dentina e polpa mudam a forma como cada dente reflete a luz. Por isso o planejamento começa pela observação, não pelo tom mais claro da escala.",
      labels: { enamel: "Esmalte", dentine: "Dentina", pulp: "Polpa" },
    },
    implant: {
      title: "Quando falta um dente, devolvemos forma e função.",
      body: "Coroas e implantes planejados para se integrar ao sorriso, com a mesma atenção à cor e à translucidez.",
    },
  },
  alts: {
    k1: "Ilustração 3D de um molar com coroa de porcelana perolada e raízes de vidro fosco.",
    cutaway: "Ilustração 3D do mesmo molar cortado ao meio, mostrando esmalte, dentina e polpa.",
    implant: "Ilustração 3D de um implante dentário: coroa de porcelana, pilar e parafuso.",
  },
},
```

- [ ] **Step 2: `scene-stills.tsx`** — `SceneStill({ name: "k1" | "cutaway" | "implant", alt, priority?, className? })` renders `<img src="/tooth/<name>-1024.webp" srcSet="…-640.webp 640w, …-1024.webp 1024w, …-1600.webp 1600w" sizes="(min-width: 1024px) 40vw, 80vw" width={1024} height={1024} alt decoding="async" fetchPriority={priority ? "high" : undefined} loading={priority ? undefined : "lazy"} className="mix-blend-multiply …" />`.
- [ ] **Step 3: `tooth-scene.tsx`** (client):
  - `const ref = useRef<HTMLElement>(null); const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });`
  - Outer `<section id="inicio" aria-labelledby="hero-title" className="relative h-[300vh] max-md:h-[200vh] motion-reduce:h-auto">`; inner `sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto`.
  - Layout: `Container` grid; left col (7): `HeroTitle` (h1, unchanged), lead+body, CTAs, trust line, then `<BeatCopy progress={scrollYProgress} />` (three beats stacked, Motion opacity/y per `beatForProgress`; all three rendered in the DOM so text is always in the accessibility tree; inactive beats `aria-hidden` visually faded, never `display:none`).
  - Right col (5): stage `relative aspect-square`; layers bottom→top: `ShaderSlot variant="hero"` halo (rounded-full, blurred, 80% size), `SceneStill name="k1" priority`, `FrameCanvas` (active while `beat === "turn"`), cutaway still wrapped in `motion.div` with `clipPath: useTransform(scrollYProgress, p => \`ellipse(${wipeProgress(p, SCENE.turnEnd) * 75}% ${wipeProgress(p, SCENE.turnEnd) * 90}% at 50% 50%)\`)`, implant still likewise at `SCENE.layersEnd`; `ArchLabels` slot (Task 6).
  - Giant wordmark: `<p aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[clamp(6rem,22vw,22rem)] font-light leading-none text-foreground/[0.06]">Opalina</p>` behind the stage (z-order below tooth).
  - Reduced motion: CSS `motion-reduce:` removes sticky/height; `useReducedMotion()` is NOT used for markup (hydration rule from the previous branch); canvas renders but `FrameCanvas` receives `active={false}` via a `matchMedia` check inside an effect; the three stills render stacked via `motion-reduce:` utilities (cutaway/implant wrappers become `static`, `clip-path: none!`).
- [ ] **Step 4: page.tsx** — replace Hero + Principle with `<ToothScene />`; update header wordmark link `#conteudo` stays. Delete the three files. Update any import (`light-sweep-text` only used by Principle — confirm with `git grep`).
- [ ] **Step 5:** `pnpm typecheck && pnpm check && pnpm build`; restart server on 3100; screenshots at 1440 (progress 0, 0.2, 0.5, 0.85) and 390; confirm poster visible before interaction, frames scrub after a scroll, wipes land on the right stills, wordmark behind the tooth.
- [ ] **Step 6:** commit `feat: add scroll-driven tooth scene replacing hero and principle`.

### Task 6: Layer labels with Anime.js

**Files:**
- Create: `src/components/scene/layer-labels.tsx`
- Modify: `src/components/scene/tooth-scene.tsx` (mount labels over the stage)

**Interfaces — Consumes:** `clinic.scene.beats.layers.labels`, `scrollYProgress`, `SCENE`. **Produces:** `LayerLabels({ progress: MotionValue<number> })`.

- [ ] **Step 1:** SVG overlay (`viewBox="0 0 100 100"`, `aria-hidden`) with three leader-line paths from anchor points on the cutaway (tune anchors against the generated cutaway still: enamel near crown edge, dentine mid-crown, pulp in the core) to label positions on the right/left edge. Labels are HTML `<p>` elements (absolutely positioned, `font-mono text-caption`) — real text.
- [ ] **Step 2:** Anime.js: build one paused timeline on mount — `svg.createDrawable(paths)` draw `0 0 → 0 1` staggered 120 ms, then labels opacity 0 → 1; seek it with `timeline.seek(wipeProgress(p, SCENE.turnEnd + 0.04) * timeline.duration)` from `useMotionValueEvent(progress, "change")`. Reduced motion: no timeline; lines drawn and labels visible (static). Cleanup `timeline.revert()`.
- [ ] **Step 3:** keyboard/scroll check: labels do not intercept pointer (`pointer-events-none`).
- [ ] **Step 4:** typecheck/check/build; screenshot progress 0.5 desktop + mobile. Commit `feat: add animated layer labels to the tooth scene`.

### Task 7: Treatment renders

**Files:**
- Modify: `src/components/sections/treatment-index.tsx` (use renders), `src/content/clinic.ts` (add `render: { name, alt }` per treatment)
- Delete: `src/components/sections/treatment-specimen.tsx`

- [ ] **Step 1:** content: `render` for each treatment — `lentes|facetas|clareamento|alinhadores|gengiva` → `/treatments/<id>-{640,1024}.webp`; `reabilitacao` → `/tooth/implant-{640,1024}.webp`. Alt texts in PT-BR starting "Ilustração 3D de …".
- [ ] **Step 2:** replace `TreatmentSpecimen` with `<img srcSet sizes="(min-width: 1024px) 33vw, 60vw" width={1024} height={1024} loading="lazy" decoding="async" className="h-full w-full object-contain mix-blend-multiply" />` in both the sticky panel and the mobile open row; keep the crossfade; add caption `Ilustração 3D` under the sticky panel (desktop) and under the mobile image.
- [ ] **Step 3:** delete `treatment-specimen.tsx`; `git grep TreatmentSpecimen` empty.
- [ ] **Step 4:** typecheck/check/build/e2e (existing treatment tests must still pass); screenshots desktop hover + mobile open row. Commit `feat: replace treatment specimens with 3D renders`.

### Task 8: End-to-end coverage for the scene

**Files:**
- Modify: `tests/e2e/landing.spec.ts`

- [ ] **Step 1:** tests (global page-error guard stays):
  - scene: `#inicio` exists, one `h1`, poster `img[src*="/tooth/k1-"]` has `naturalWidth > 0`;
  - scrolling changes the canvas: after hover (arms loading) + scroll to 20% of the scene, wait until `canvas` has `opacity 1`, read `canvas.toDataURL()`; scroll to 30%; dataURL differs;
  - landing mid-scene: `page.goto("/")`, `window.scrollTo` to 60% of `#inicio` height, reload with `scroll restoration` → the layers beat title is visible and the cutaway wrapper `clip-path` is not `ellipse(0% 0% …)`;
  - labels: at 55% scene progress, `Esmalte`, `Dentina`, `Polpa` visible;
  - keyboard: from the top, Tab reaches "Agendar avaliação" inside the scene and it is in the viewport;
  - resize: at 1280 wide the canvas uses desktop frames (`performance.getEntriesByType("resource")` contains `/frames/desktop/`), set viewport 390 and reload → contains `/frames/mobile/` and no new `/frames/desktop/` request;
  - reduced motion: no element with computed `position: sticky` inside `#inicio`; the three stills (`k1`, `cutaway`, `implant`) visible; existing "no canvas drawn / hero title visible" checks updated (canvas may exist but must stay `opacity 0`).
- [ ] **Step 2:** `pnpm e2e` → all pass (fix code, not tests, on failures — systematic-debugging). Commit `test: cover the scroll-driven tooth scene`.

### Task 9: QA, performance, security, docs

- [ ] **Step 1:** impeccable pass (context + polish + craft-floor): screenshots at 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920 at scene progress 0 / 0.5 / 0.9; detector once over `src/components/scene`, `src/components/sections/treatment-index.tsx`; fix in one batch, one confirmation round.
- [ ] **Step 2:** shader halo blend check: if `mix-blend-multiply` over the halo looks muddy, remove the halo from the scene (keep the contact band shader) and ledger the ruling.
- [ ] **Step 3:** Lighthouse mobile: Performance ≥ 80, CLS 0, LCP ≤ current (3.4 s simulated). If below: lower still quality, confirm frames are not fetched before interaction.
- [ ] **Step 4:** security: `git grep -n "sk-"` and `git log -p | grep -c "sk-8Mw"` → 0; `pnpm audit` clean; headers/CSP unchanged (fetch `/` and compare).
- [ ] **Step 5:** README: new section "Assets 3D (Agnes)" — how to regenerate (`.env.local`, `pnpm assets:generate`, visual gate, `FFMPEG_PATH`, `pnpm assets:process`), that renders are illustrative, and that the key must be revoked/rotated after use.
- [ ] **Step 6:** full gate `pnpm typecheck && pnpm check && pnpm test && pnpm e2e && pnpm build`. Commit `docs: document the Agnes asset pipeline`.
