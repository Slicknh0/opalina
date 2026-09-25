import { normalizeBrPhone } from "./whatsapp";

export const MESSAGE_MAX = 500;

export type BookingInput = {
  name: string;
  phone: string;
  treatment: string;
  message: string;
};
export type BookingErrors = Partial<Record<keyof BookingInput, string>>;
export type BookingResult =
  | { ok: true; data: BookingInput }
  | { ok: false; errors: BookingErrors };

export function validateBooking(
  input: BookingInput,
  treatmentIds: readonly string[],
): BookingResult {
  const data: BookingInput = {
    name: input.name.trim().replace(/\s+/g, " "),
    phone: input.phone.trim(),
    treatment: input.treatment,
    message: input.message.trim(),
  };

  const errors: BookingErrors = {};
  if (data.name.length < 2 || data.name.length > 80) {
    errors.name = "Informe seu nome completo.";
  }
  if (!normalizeBrPhone(data.phone)) {
    errors.phone = "Informe um WhatsApp válido com DDD.";
  }
  if (!treatmentIds.includes(data.treatment)) {
    errors.treatment = "Escolha uma opção.";
  }
  if (data.message.length > MESSAGE_MAX) {
    errors.message = `Use no máximo ${MESSAGE_MAX} caracteres.`;
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, data };
}

export function composeBookingMessage(
  data: BookingInput,
  treatmentLabel: string,
): string {
  const lines = [
    "Olá! Gostaria de agendar uma avaliação na Opalina.",
    `Nome: ${data.name}`,
    `Interesse: ${treatmentLabel}`,
  ];
  if (data.message) lines.push(`Observação: ${data.message}`);
  return lines.join("\n");
}
