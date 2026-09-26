import { describe, expect, it } from "vitest";
import { buildRequest, pendingAssets } from "./agnes.ts";
import type { Manifest } from "./manifest.ts";

const m: Manifest = {
  styleSuffix: "s",
  assets: [
    { id: "a", kind: "image", prompt: "p", size: "1024x1024", seed: 7 },
    {
      id: "b",
      kind: "image-edit",
      prompt: "p",
      inputs: ["a"],
      size: "1024x1024",
    },
    {
      id: "v",
      kind: "keyframes-video",
      prompt: "p",
      inputs: ["a", "b"],
      width: 768,
      height: 768,
      numFrames: 97,
      frameRate: 24,
    },
  ],
};

describe("buildRequest", () => {
  it("builds a text-to-image request", () => {
    expect(buildRequest(m.assets[0], "p, s", [])).toEqual({
      path: "/v1/images/generations",
      body: {
        model: "agnes-image-2.1-flash",
        prompt: "p, s",
        size: "1024x1024",
        seed: 7,
      },
    });
  });

  it("passes edit inputs in extra_body.image", () => {
    expect(
      buildRequest(m.assets[1], "p, s", ["https://x/a.png"]).body,
    ).toMatchObject({
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
    expect(
      pendingAssets(m, { a: {}, b: {}, v: {} }, "b").map((a) => a.id),
    ).toEqual(["b"]);
  });
});
