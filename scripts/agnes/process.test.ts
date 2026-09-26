import { describe, expect, it } from "vitest";
import { frameExtractArgs, requireInputs, stillArgs } from "./process-args.ts";

describe("frameExtractArgs", () => {
  it("samples exactly `count` frames evenly across the clean range", () => {
    const args = frameExtractArgs("in.mp4", "out", {
      start: 0,
      end: 3.2,
      count: 48,
      width: 960,
    });
    expect(args).toEqual([
      "-y",
      "-ss",
      "0",
      "-to",
      "3.2",
      "-i",
      "in.mp4",
      "-vf",
      "fps=15,colorlevels=rimax=0.92:gimax=0.92:bimax=0.92,scale=960:-2:flags=lanczos",
      "-frames:v",
      "48",
      "-c:v",
      "libwebp",
      "-quality",
      "80",
      "out/%03d.webp",
    ]);
  });
});

describe("stillArgs", () => {
  it("scales a still to webp at the given width", () => {
    expect(stillArgs("k1.png", "k1-640.webp", 640)).toEqual([
      "-y",
      "-i",
      "k1.png",
      "-vf",
      "colorlevels=rimax=0.92:gimax=0.92:bimax=0.92,scale=640:-2:flags=lanczos",
      "-c:v",
      "libwebp",
      "-quality",
      "82",
      "k1-640.webp",
    ]);
  });
});

describe("requireInputs", () => {
  it("names every missing file", () => {
    expect(() =>
      requireInputs(["a.png", "b.mp4"], (f) => f === "a.png"),
    ).toThrow(/b\.mp4/);
  });

  it("passes when all exist", () => {
    expect(() => requireInputs(["a.png"], () => true)).not.toThrow();
  });
});
