/** Normalizes a Brazilian phone (with DDD) to E.164 digits without "+", or null. */
export function normalizeBrPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  // 11-digit numbers are mobiles, which always start with 9 after the DDD.
  if (digits.length === 11 && digits[2] !== "9") return null;
  return `55${digits}`;
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
