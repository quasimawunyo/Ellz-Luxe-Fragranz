export function ghanaWaDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `233${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappHref(phone: string, message?: string) {
  const digits = ghanaWaDigits(phone);
  if (digits.length < 10 || /^2330+$/.test(digits) || /^0+$/.test(digits)) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
