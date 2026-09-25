import { describe, expect, it } from "vitest";
import { bookingHref, phoneHref, resolveBookingTarget } from "./contact";
import { placeholder } from "./placeholder";

describe("bookingHref", () => {
  it("points to the contact section while WhatsApp is a placeholder", () => {
    expect(bookingHref(placeholder("WhatsApp"))).toBe("#contato");
  });

  it("opens WhatsApp with a greeting when the number is real", () => {
    const url = new URL(bookingHref("5511987654321"));
    expect(url.pathname).toBe("/5511987654321");
    expect(url.searchParams.get("text")).toMatch(/avaliação/);
  });
});

describe("phoneHref", () => {
  it("points to the contact section while the phone is a placeholder", () => {
    expect(phoneHref(placeholder("Telefone"))).toBe("#contato");
  });

  it("builds a tel: link from a formatted number", () => {
    expect(phoneHref("(11) 3456-7890")).toBe("tel:+551134567890");
  });
});

describe("resolveBookingTarget", () => {
  it("is not-configured while WhatsApp is a placeholder", () => {
    expect(resolveBookingTarget(placeholder("WhatsApp"), "oi")).toEqual({
      kind: "not-configured",
    });
  });

  it("builds a wa.me link for a real number", () => {
    expect(resolveBookingTarget("5511987654321", "oi")).toEqual({
      kind: "whatsapp",
      url: "https://wa.me/5511987654321?text=oi",
    });
  });
});
