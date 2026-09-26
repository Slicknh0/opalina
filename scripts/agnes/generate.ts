/**
 * Generates the raw Agnes assets listed in assets.json into art/raw/.
 * Usage: node scripts/agnes/generate.ts [--only <id>] [--dry-run]
 * Needs AGNES_API_KEY in .env.local. Agnes output URLs are temporary, so an
 * edit or video must run in the same session as its inputs (or regenerate
 * them first with --only).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildRequest, pendingAssets } from "./agnes.ts";
import { fullPrompt, type Manifest, validateManifest } from "./manifest.ts";

const API = "https://apihub.agnes-ai.com";
const RAW = "art/raw";
const INDEX = `${RAW}/index.json`;

type Entry = { url: string; file: string };
type Json = Record<string, unknown>;

const args = process.argv.slice(2);
const only = args.includes("--only")
  ? args[args.indexOf("--only") + 1]
  : undefined;
const dryRun = args.includes("--dry-run");

const manifest = JSON.parse(
  readFileSync("scripts/agnes/assets.json", "utf8"),
) as Manifest;
const errors = validateManifest(manifest);
if (errors.length) throw new Error(`Invalid manifest:\n${errors.join("\n")}`);

let KEY = "";
if (!dryRun) {
  process.loadEnvFile(".env.local");
  KEY = process.env.AGNES_API_KEY ?? "";
  if (!KEY) throw new Error("AGNES_API_KEY missing in .env.local");
}

mkdirSync(RAW, { recursive: true });
const index: Record<string, Entry> = existsSync(INDEX)
  ? JSON.parse(readFileSync(INDEX, "utf8"))
  : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(
  method: string,
  path: string,
  body?: unknown,
): Promise<Json> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 && attempt <= 6) {
      console.log(`  429, waiting 65s (attempt ${attempt})`);
      await sleep(65_000);
      continue;
    }
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `${method} ${path} → ${res.status}: ${text.slice(0, 300)}`,
      );
    }
    return JSON.parse(text) as Json;
  }
}

async function download(url: string, file: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${file} → ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const pick = (r: Json, ...paths: string[][]): unknown => {
  for (const p of paths) {
    let v: unknown = r;
    for (const k of p) v = (v as Json | undefined)?.[k];
    if (v !== undefined) return v;
  }
  return undefined;
};

for (const asset of pendingAssets(manifest, index, only)) {
  const inputs = (asset.inputs ?? []).map((id) => {
    const url = index[id]?.url;
    if (!url && !dryRun) {
      throw new Error(
        `"${asset.id}" needs "${id}", which is not generated yet`,
      );
    }
    return url ?? `<${id}>`;
  });
  const { path, body } = buildRequest(
    asset,
    fullPrompt(manifest, asset),
    inputs,
  );
  console.log(`→ ${asset.id} (${asset.kind})`);
  if (dryRun) continue;

  if (asset.kind === "keyframes-video") {
    const created = await call("POST", path, body);
    const id = String(pick(created, ["video_id"], ["id"], ["task_id"]));
    const pollPath = id.startsWith("task_")
      ? `/v1/videos/${id}`
      : `/agnesapi?video_id=${encodeURIComponent(id)}`;
    for (let i = 0; ; i++) {
      await sleep(10_000);
      const r = await call("GET", pollPath);
      const status = String(r.status ?? "").toLowerCase();
      const url = pick(
        r,
        ["metadata", "url"],
        ["video_url"],
        ["url"],
        ["output_url"],
        ["result", "video_url"],
      );
      if (/fail|error|cancel/.test(status)) {
        throw new Error(`video ${asset.id} failed: ${status}`);
      }
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
    const url = pick(r, ["data", "0", "url"]);
    if (typeof url !== "string") {
      throw new Error(`image ${asset.id}: no url in response`);
    }
    const file = `${RAW}/${asset.id}.png`;
    await download(url, file);
    index[asset.id] = { url, file };
  }
  writeFileSync(INDEX, JSON.stringify(index, null, 2));
  console.log(`  saved ${index[asset.id].file}`);
}
