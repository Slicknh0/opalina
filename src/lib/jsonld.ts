import type { clinic as clinicData } from "@/content/clinic";
import { isPlaceholder, type Maybe } from "./placeholder";
import { normalizeBrPhone } from "./whatsapp";

type Clinic = typeof clinicData;

const real = (value: Maybe<string>) =>
  isPlaceholder(value) ? undefined : value;

/** schema.org Dentist data built only from real values — placeholders are omitted. */
export function buildDentistJsonLd(clinic: Clinic, siteUrl: string) {
  const phone = real(clinic.phone);
  const digits = phone ? normalizeBrPhone(phone) : null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinic.name,
    description: `${clinic.descriptor} nos ${clinic.neighborhood}, ${clinic.city}.`,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      ...(real(clinic.address) && { streetAddress: real(clinic.address) }),
      addressLocality: clinic.city,
      addressRegion: clinic.state,
      addressCountry: "BR",
    },
    medicalSpecialty: "Dentistry",
  };
  if (digits) data.telephone = `+${digits}`;
  const hours = real(clinic.hours);
  if (hours) data.openingHours = hours;
  return data;
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so it cannot end the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
