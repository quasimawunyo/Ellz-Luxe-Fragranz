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
  items: { productName: string; variantLabel: string; quantity: number }[];
};

export function annexOrderNotice(order: AnnexOrderNotice) {
  const lines = [
    `New EllzLuxe order ${order.orderNumber}`,
    `Payment: ${order.paymentStatus}`,
    `Total: ${formatMoney(order.totalMinor, order.currencyCode)}`,
    `Customer: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Deliver: ${order.deliveryMethod}`,
    `${order.addressLine}, ${order.locality}, ${order.region}`,
    ...order.items.map((item) => `- ${item.productName} (${item.variantLabel}) × ${item.quantity}`),
  ];
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  return lines.join("\n");
}

export function annexOrderWhatsAppHref(phone: string, order: AnnexOrderNotice) {
  return whatsappHref(phone, annexOrderNotice(order));
}
