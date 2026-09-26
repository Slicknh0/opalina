import { describe, expect, it } from "vitest";
import { isPlaceholder } from "@/lib/placeholder";
import { clinic } from "./clinic";

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (value && typeof value === "object" && !isPlaceholder(value)) {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

describe("clinic content", () => {
  it("has unique treatment ids", () => {
    const ids = clinic.treatments.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("offers only known booking options", () => {
    const ids = new Set(clinic.treatments.map((t) => t.id));
    for (const option of clinic.bookingOptions) {
      expect(ids.has(option.id) || option.id === "avaliacao").toBe(true);
    }
  });

  it("answers at least five questions", () => {
    expect(clinic.faq.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps verifiable facts as placeholders", () => {
    for (const value of [
      clinic.address,
      clinic.phone,
      clinic.whatsapp,
      clinic.hours,
      clinic.doctor.name,
      clinic.doctor.cro,
      clinic.responsible.cro,
      clinic.review.quote,
    ]) {
      expect(isPlaceholder(value)).toBe(true);
    }
  });

  it("contains no fabricated statistics", () => {
    const fabricated =
      /\d+\s*(anos|pacientes|sorrisos|tratamentos realizados|%)|\d(,\d)?\s*estrelas/i;
    for (const text of collectStrings(clinic)) {
      expect(text).not.toMatch(fabricated);
    }
  });
});
