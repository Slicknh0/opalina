import { describe, expect, it } from "vitest";
import { isPlaceholder, placeholder } from "./placeholder";

describe("placeholder", () => {
  it("marks a value as placeholder with its label", () => {
    const p = placeholder("Telefone da clínica");
    expect(isPlaceholder(p)).toBe(true);
    expect(p.label).toBe("Telefone da clínica");
  });

  it("does not flag real values", () => {
    expect(isPlaceholder("Jardins")).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
    expect(isPlaceholder({ label: "x" })).toBe(false);
  });
});
