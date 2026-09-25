import { describe, expect, it } from "vitest";
import { clinic } from "@/content/clinic";
import { buildDentistJsonLd, serializeJsonLd } from "./jsonld";
import { isPlaceholder } from "./placeholder";

describe("buildDentistJsonLd", () => {
  it("describes the clinic as a Dentist in São Paulo", () => {
    const data = buildDentistJsonLd(clinic, "https://opalina.example");
    expect(data["@type"]).toBe("Dentist");
    expect(data.name).toBe("Opalina");
    expect(data.url).toBe("https://opalina.example");
    expect(data.address).toMatchObject({
      addressLocality: "São Paulo",
      addressRegion: "SP",
      addressCountry: "BR",
    });
  });

  it("omits every field that is still a placeholder", () => {
    const data = buildDentistJsonLd(clinic, "https://opalina.example");
    expect(data).not.toHaveProperty("telephone");
    expect(data.address).not.toHaveProperty("streetAddress");
    const all = JSON.stringify(data);
    expect(all).not.toContain('"kind":"placeholder"');
    expect(isPlaceholder(clinic.phone)).toBe(true);
  });

  it("includes real values once provided", () => {
    const data = buildDentistJsonLd(
      { ...clinic, phone: "(11) 3456-7890", address: "Rua Exemplo, 100" },
      "https://opalina.example",
    );
    expect(data.telephone).toBe("+551134567890");
    expect(data.address).toMatchObject({ streetAddress: "Rua Exemplo, 100" });
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});
