import { describe, expect, it } from "vitest";
import { composeBookingMessage, MESSAGE_MAX, validateBooking } from "./booking";

const ids = ["lentes", "clareamento", "avaliacao"] as const;
const valid = {
  name: "Marina Alves",
  phone: "(11) 98765-4321",
  treatment: "lentes",
  message: "",
};

describe("validateBooking", () => {
  it("accepts a complete form and trims fields", () => {
    const r = validateBooking(
      { ...valid, name: "  Marina   Alves  ", message: "  oi " },
      ids,
    );
    expect(r).toEqual({ ok: true, data: { ...valid, message: "oi" } });
  });

  it("rejects a whitespace-only name", () => {
    const r = validateBooking({ ...valid, name: "   " }, ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.name).toMatch(/nome/i);
  });

  it("rejects an invalid phone", () => {
    const r = validateBooking({ ...valid, phone: "1234" }, ids);
    expect(r.ok === false && r.errors.phone).toMatch(/WhatsApp/);
  });

  it("rejects an unknown treatment", () => {
    const r = validateBooking({ ...valid, treatment: "botox" }, ids);
    expect(r.ok === false && r.errors.treatment).toBeTruthy();
  });

  it("rejects messages over the limit", () => {
    const r = validateBooking(
      { ...valid, message: "a".repeat(MESSAGE_MAX + 1) },
      ids,
    );
    expect(r.ok === false && r.errors.message).toMatch(String(MESSAGE_MAX));
  });
});

describe("composeBookingMessage", () => {
  it("includes name, treatment and optional message", () => {
    const text = composeBookingMessage(
      { ...valid, message: "Prefiro manhãs" },
      "Lentes de contato dental",
    );
    expect(text).toContain("Marina Alves");
    expect(text).toContain("Lentes de contato dental");
    expect(text).toContain("Prefiro manhãs");
  });

  it("omits the message line when empty", () => {
    expect(composeBookingMessage(valid, "Lentes")).not.toContain("Observação");
  });
});
