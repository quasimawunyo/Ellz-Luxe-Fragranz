export function whatsappHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || /^2330+$/.test(digits) || /^0+$/.test(digits)) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
