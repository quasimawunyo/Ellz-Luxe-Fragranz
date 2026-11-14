import { ghanaWaDigits } from "@/lib/whatsapp";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/orders/transitions";

export function normalizeOrderNumber(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function classifyTrackQuery(value: string): "order" | "phone" | "invalid" {
  const compact = value.trim();
  if (!compact) return "invalid";
  if (/elf/i.test(compact.replace(/\s+/g, ""))) return "order";
  const digits = compact.replace(/\D/g, "");
  if (!/[a-z]/i.test(compact) && digits.length >= 9 && digits.length <= 15) return "phone";
  if (compact.replace(/\s+/g, "").length >= 4) return "order";
  return "invalid";
}

export function phonesMatch(stored: string, given: string) {
  const left = ghanaWaDigits(stored);
  const right = ghanaWaDigits(given);
  return left.length === 12 && left.startsWith("233") && left === right;
}

export function orderEmailMatches(orderEmail: string, givenEmail: string) {
  return orderEmail.trim().toLowerCase() === givenEmail.trim().toLowerCase();
}

export function customerFulfilmentLine(status: FulfillmentStatus) {
  const lines: Record<FulfillmentStatus, string> = {
    new: "We have your order",
    packed: "Packed",
    out_for_delivery: "Out for delivery",
    ready_for_pickup: "Ready for pickup at Ells Luxe Annex, Pantang",
    delivered: "Delivered",
    collected: "Collected",
    cancelled: "Cancelled",
  };
  return lines[status];
}

export function customerPaymentLine(status: PaymentStatus) {
  const lines: Record<PaymentStatus, string> = {
    pending: "Waiting for payment",
    paid: "Paid",
    failed: "Payment did not go through",
    refunded: "Refunded",
  };
  return lines[status];
}
