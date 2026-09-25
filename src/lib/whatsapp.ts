/**
 * Normalizes a Brazilian phone (with DDD) to E.164 digits without "+", or null.
 * Only digits and the usual separators are accepted — a stray letter (an "O"
 * typed for a zero) is an error, never silently dropped.
 */
export function normalizeBrPhone(input: string): string | null {
  if (/[^\d\s()+.-]/.test(input)) return null;
  let digits = input.replace(/\D/g, "");
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  // Area codes (DDD) run from 11 to 99 and never contain a zero.
  if (digits[0] === "0" || digits[1] === "0") return null;
  // Mobiles (11 digits) start with 9 after the DDD; landlines with 2–5.
  if (digits.length === 11 && digits[2] !== "9") return null;
  if (digits.length === 10 && !"2345".includes(digits[2])) return null;
  return `55${digits}`;
}

/** "5511987654321" → "+55 11 98765-4321" */
export function formatBrPhone(e164Digits: string): string {
  const ddd = e164Digits.slice(2, 4);
  const local = e164Digits.slice(4);
  const split = local.length - 4;
  return `+55 ${ddd} ${local.slice(0, split)}-${local.slice(split)}`;
}

export function buildWhatsAppLink(
  phoneDigits: string,
  message: string,
): string {
  if (!/^55\d{10,11}$/.test(phoneDigits)) {
    throw new Error("buildWhatsAppLink expects normalized BR digits");
  }
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
