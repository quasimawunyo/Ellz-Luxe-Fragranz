export const fulfillmentStatuses = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

const fulfillmentTransitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  unfulfilled: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransitionFulfillment(
  from: FulfillmentStatus,
  to: FulfillmentStatus,
) {
  return fulfillmentTransitions[from].includes(to);
}

export function assertFulfillmentTransition(
  from: FulfillmentStatus,
  to: FulfillmentStatus,
) {
  if (!canTransitionFulfillment(from, to)) {
    throw new Error(`Cannot change fulfillment from ${from} to ${to}.`);
  }
}

export function isPaidRevenue(status: PaymentStatus) {
  return status === "paid";
}
