import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, normalizeBrPhone } from "./whatsapp";

describe("normalizeBrPhone", () => {
  it.each([
    ["(11) 98765-4321", "5511987654321"],
    ["+55 11 98765 4321", "5511987654321"],
    ["11987654321", "5511987654321"],
    ["11 3456-7890", "551134567890"],
    ["5511987654321", "5511987654321"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeBrPhone(input)).toBe(expected);
  });

  it.each([
    "",
    "abc",
    "12345",
    "(11) 9876",
    "+1 415 555 0100 99",
    "11 88765-4321",
  ])("rejects %s", (input) => {
    expect(normalizeBrPhone(input)).toBeNull();
  });
});

describe("buildWhatsAppLink", () => {
  it("encodes accents, emoji, reserved chars and newlines", () => {
    const msg = "Olá! Avaliação & lentes? #1\nObrigada 😊";
    const url = new URL(buildWhatsAppLink("5511987654321", msg));
    expect(url.origin + url.pathname).toBe("https://wa.me/5511987654321");
    expect(url.searchParams.get("text")).toBe(msg);
  });

  it("throws on non-normalized numbers", () => {
    expect(() => buildWhatsAppLink("(11) 98765-4321", "x")).toThrow();
  });
});
