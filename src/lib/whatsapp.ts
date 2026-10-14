import { formatMoney } from "@/lib/money";

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

export function formatGhanaPhone(phone: string) {
  const digits = ghanaWaDigits(phone);
  if (digits.startsWith("233") && digits.length === 12) {
    return `0${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone.trim();
}

export function customerOrderWhatsAppMessage(order: { orderNumber: string; fullName: string }) {
  return `Hello ${order.fullName}, this is EllzLuxe Fragranz about order ${order.orderNumber}.`;
}

export type AnnexOrderNotice = {
  orderNumber: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  locality: string;
  addressLine: string;
  deliveryMethod: string;
  paymentStatus: string;
  notes: string | null;
  currencyCode: string;
  totalMinor: number;
  shippingMinor?: number;
  items: { productName: string; variantLabel: string; quantity: number }[];
};

export function annexOrderNotice(order: AnnexOrderNotice) {
  const quoted = (order.shippingMinor ?? 0) === 0 && !/pickup/i.test(order.deliveryMethod);
  const lines = [
    `New EllzLuxe order ${order.orderNumber}`,
    `Payment: ${order.paymentStatus}`,
    quoted
      ? `Goods total: ${formatMoney(order.totalMinor, order.currencyCode)}`
      : `Total: ${formatMoney(order.totalMinor, order.currencyCode)}`,
    `Customer: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Deliver: ${order.deliveryMethod}`,
    `${order.addressLine}, ${order.locality}, ${order.region}`,
  ];
  if (quoted) {
    lines.push(`Delivery fee: quote for ${order.locality}, ${order.region}`);
  }
  lines.push(...order.items.map((item) => `- ${item.productName} (${item.variantLabel}) × ${item.quantity}`));
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  return lines.join("\n");
}

export function annexOrderWhatsAppHref(phone: string, order: AnnexOrderNotice) {
  return whatsappHref(phone, annexOrderNotice(order));
}
