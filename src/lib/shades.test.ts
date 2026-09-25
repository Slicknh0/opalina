import { describe, expect, it } from "vitest";
import { DEFAULT_SHADE, relativeLuminance, SHADES } from "./shades";

describe("SHADES", () => {
  it("has unique codes", () => {
    expect(new Set(SHADES.map((s) => s.code)).size).toBe(SHADES.length);
  });

  it("is ordered from lightest to darkest", () => {
    const l = SHADES.map((s) => relativeLuminance(s.hex));
    for (let i = 1; i < l.length; i++) expect(l[i]).toBeLessThan(l[i - 1]);
  });

  it("includes the default shade", () => {
    expect(SHADES.some((s) => s.code === DEFAULT_SHADE)).toBe(true);
  });
});

describe("relativeLuminance", () => {
  it("is 1 for white and 0 for black", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
    expect(relativeLuminance("#000000")).toBeCloseTo(0);
  });
});
