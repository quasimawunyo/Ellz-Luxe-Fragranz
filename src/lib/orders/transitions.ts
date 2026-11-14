export const fulfillmentStatuses = [
  "new",
  "packed",
  "out_for_delivery",
  "ready_for_pickup",
  "delivered",
  "collected",
  "cancelled",
] as const;

export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export const manualPaymentMethods = ["mobile_money", "cash", "card"] as const;

export type ManualPaymentMethod = (typeof manualPaymentMethods)[number];

export function isPickupOrder(deliveryMethod: string) {
  return /pickup/i.test(deliveryMethod);
}

export function normalizeFulfillmentStatus(value: string, deliveryMethod = ""): FulfillmentStatus {
  if ((fulfillmentStatuses as readonly string[]).includes(value)) return value as FulfillmentStatus;
  if (value === "unfulfilled") return "new";
  if (value === "processing") return "packed";
  if (value === "shipped") return isPickupOrder(deliveryMethod) ? "ready_for_pickup" : "out_for_delivery";
  if (value === "delivered" && isPickupOrder(deliveryMethod)) return "collected";
  if (value === "delivered") return "delivered";
  return "new";
}

export function nextFulfillmentStatus(current: FulfillmentStatus, deliveryMethod: string): FulfillmentStatus | null {
  if (current === "new") return "packed";
  if (current === "packed") return isPickupOrder(deliveryMethod) ? "ready_for_pickup" : "out_for_delivery";
  if (current === "out_for_delivery") return "delivered";
  if (current === "ready_for_pickup") return "collected";
  return null;
}

export function canCancelFulfillment(current: FulfillmentStatus) {
  return current !== "cancelled" && current !== "delivered" && current !== "collected";
}

const fulfillmentTransitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  new: ["packed", "cancelled"],
  packed: ["out_for_delivery", "ready_for_pickup", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  ready_for_pickup: ["collected", "cancelled"],
  delivered: [],
  collected: [],
  cancelled: [],
};

export function canTransitionFulfillment(from: FulfillmentStatus, to: FulfillmentStatus) {
  return fulfillmentTransitions[from].includes(to);
}

export function assertFulfillmentTransition(from: FulfillmentStatus, to: FulfillmentStatus) {
  if (!canTransitionFulfillment(from, to)) {
    throw new Error(`Cannot change fulfilment from ${from.replaceAll("_", " ")} to ${to.replaceAll("_", " ")}.`);
  }
}

export function needsFulfilmentAction(status: FulfillmentStatus) {
  return status === "new" || status === "packed" || status === "out_for_delivery" || status === "ready_for_pickup";
}

export function customerEmailForFulfilment(status: FulfillmentStatus): status is "out_for_delivery" | "ready_for_pickup" {
  return status === "out_for_delivery" || status === "ready_for_pickup";
}

export function isPaidRevenue(status: PaymentStatus) {
  return status === "paid";
}

export function fulfilmentLabel(status: FulfillmentStatus) {
  const labels: Record<FulfillmentStatus, string> = {
    new: "New",
    packed: "Packed",
    out_for_delivery: "Out for delivery",
    ready_for_pickup: "Ready for pickup",
    delivered: "Delivered",
    collected: "Collected",
    cancelled: "Cancelled",
  };
  return labels[status];
}
