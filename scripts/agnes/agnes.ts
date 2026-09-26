import type { AssetSpec, Manifest } from "./manifest.ts";

/** Request path and JSON body for one asset, per the Agnes API. */
export function buildRequest(
  asset: AssetSpec,
  prompt: string,
  inputUrls: string[],
): { path: string; body: Record<string, unknown> } {
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
      },
    };
  }
  const body: Record<string, unknown> = {
    model: "agnes-image-2.1-flash",
    prompt,
  };
  if (asset.size) body.size = asset.size;
  if (asset.seed !== undefined) body.seed = asset.seed;
  if (asset.kind === "image-edit") body.extra_body = { image: inputUrls };
  return { path: "/v1/images/generations", body };
}

/** Assets still to generate: everything not done yet, or just `only` when given. */
export function pendingAssets(
  m: Manifest,
  done: Record<string, unknown>,
  only?: string,
): AssetSpec[] {
  if (only) return m.assets.filter((a) => a.id === only);
  return m.assets.filter((a) => !(a.id in done));
}
