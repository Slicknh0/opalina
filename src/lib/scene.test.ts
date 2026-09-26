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
    expect(frameUrl(FRAME_SETS.desktop, 0)).toBe(
      "/tooth/frames/desktop/001.webp",
    );
    expect(frameUrl(FRAME_SETS.mobile, 23)).toBe(
      "/tooth/frames/mobile/024.webp",
    );
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
