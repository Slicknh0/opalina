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
