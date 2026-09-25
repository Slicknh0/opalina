import { isPlaceholder, type Maybe } from "./placeholder";
import { buildWhatsAppLink, normalizeBrPhone } from "./whatsapp";

const GREETING = "Olá! Gostaria de agendar uma avaliação na Opalina.";

/** Where "Agendar avaliação" leads: WhatsApp when configured, else the contact section. */
export function bookingHref(whatsapp: Maybe<string>): string {
  if (isPlaceholder(whatsapp)) return "#contato";
  return buildWhatsAppLink(whatsapp, GREETING);
}

export function phoneHref(phone: Maybe<string>): string {
  if (isPlaceholder(phone)) return "#contato";
  const digits = normalizeBrPhone(phone);
  return digits ? `tel:+${digits}` : "#contato";
}

export type BookingTarget =
  | { kind: "whatsapp"; url: string }
  | { kind: "not-configured" };

/** Where a validated booking goes. Never pretends to send while the number is a placeholder. */
export function resolveBookingTarget(
  whatsapp: Maybe<string>,
  message: string,
): BookingTarget {
  if (isPlaceholder(whatsapp)) return { kind: "not-configured" };
  return { kind: "whatsapp", url: buildWhatsAppLink(whatsapp, message) };
}

/** An https URL from content, or null — never javascript:, data:, http: or protocol-relative. */
export function externalHref(href: string): string | null {
  try {
    return new URL(href.trim()).protocol === "https:" ? href.trim() : null;
  } catch {
    return null;
  }
}
