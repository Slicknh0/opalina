import { describe, expect, it } from "vitest";
import manifest from "./assets.json" with { type: "json" };
import { fullPrompt, type Manifest, validateManifest } from "./manifest.ts";

const base: Manifest = {
  styleSuffix: "studio light",
  assets: [
    { id: "a", kind: "image", prompt: "tooth", size: "1024x1024" },
    {
      id: "b",
      kind: "image-edit",
      prompt: "turn",
      inputs: ["a"],
      size: "1024x1024",
    },
    {
      id: "v",
      kind: "keyframes-video",
      prompt: "spin",
      inputs: ["a", "b"],
      width: 768,
      height: 768,
      numFrames: 97,
      frameRate: 24,
    },
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
        {
          id: "v",
          kind: "keyframes-video",
          prompt: "s",
          inputs: ["a"],
          numFrames: 100,
        },
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
