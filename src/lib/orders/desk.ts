import type { OrderPayment, StoreOrder } from "@/lib/orders/types";
import { isPickupOrder, needsFulfilmentAction, type FulfillmentStatus, type PaymentStatus } from "@/lib/orders/transitions";

export function amountPaidMinor(payments: OrderPayment[]) {
  const paid = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amountMinor, 0);
  const refunded = payments
    .filter((payment) => payment.status === "refunded")
    .reduce((sum, payment) => sum + payment.amountMinor, 0);
  return Math.max(0, paid - refunded);
}

export function balanceDueMinor(totalMinor: number, payments: OrderPayment[]) {
  return Math.max(0, totalMinor - amountPaidMinor(payments));
}

export type OrderListQuery = {
  q?: string;
  payment?: string;
  fulfilment?: string;
  method?: string;
  from?: string;
  to?: string;
  tests?: string;
  view?: string;
  fee?: string;
  attention?: string;
  review?: string;
};

export function isDefaultOrderQueue(query: OrderListQuery) {
  return !query.view && !query.q && !query.payment && !query.fulfilment && !query.method && !query.from && !query.to && query.tests !== "1" && !query.fee && !query.attention && !query.review;
}

function accraDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function filterOrders(orders: StoreOrder[], query: OrderListQuery) {
  const queue = isDefaultOrderQueue(query);
  const needle = query.q?.trim().toLowerCase() ?? "";
  const needleDigits = query.q?.replace(/\D/g, "") ?? "";
  return orders
    .filter((order) => {
      if (query.tests === "only") return order.isTest;
      if (query.tests !== "1" && order.isTest) return false;
      if (queue) {
        return order.paymentStatus === "paid" && needsFulfilmentAction(order.fulfillmentStatus);
      }
      if (query.payment && order.paymentStatus !== (query.payment as PaymentStatus)) return false;
      if (query.fulfilment && order.fulfillmentStatus !== (query.fulfilment as FulfillmentStatus)) return false;
      if (query.method === "pickup" && !isPickupOrder(order.deliveryMethod)) return false;
      if (query.method === "delivery" && isPickupOrder(order.deliveryMethod)) return false;
      if (query.fee === "missing") {
        const open = ["new", "packed", "out_for_delivery", "ready_for_pickup"].includes(order.fulfillmentStatus);
        if (!open || order.shippingMinor !== 0 || isPickupOrder(order.deliveryMethod)) return false;
      }
      if (query.attention === "1" && (!order.needsAttention || order.fulfillmentStatus === "cancelled")) return false;
      if (query.review === "1" && !order.awaitingReview) return false;
      if (needle) {
        const phone = order.phone.replace(/\D/g, "");
        const matches =
          order.orderNumber.toLowerCase().includes(needle) ||
          order.fullName.toLowerCase().includes(needle) ||
          order.phone.toLowerCase().includes(needle) ||
          (needleDigits.length >= 3 && phone.includes(needleDigits));
        if (!matches) return false;
      }
      const day = accraDay(order.createdAt);
      if (query.from && day < query.from) return false;
      if (query.to && day > query.to) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function orderListHeading(query: OrderListQuery) {
  if (query.fee === "missing") return "Waiting for a delivery fee";
  if (query.attention === "1") return "Needs attention";
  if (query.review === "1") return "Review";
  if (query.payment === "paid" && query.fulfilment === "new") return "Waiting to be packed";
  if (query.fulfilment === "out_for_delivery") return "Out for delivery";
  if (isDefaultOrderQueue(query)) return "Orders to do";
  return "Orders";
}

export function ordersToCsv(orders: StoreOrder[]) {
  const header = [
    "Order",
    "Date",
    "Customer",
    "Phone",
    "Email",
    "Delivery method",
    "Fulfilment",
    "Payment",
    "Goods",
    "Delivery fee",
    "Total",
    "Amount paid",
    "Balance due",
    "Test",
  ];
  const lines = orders.map((order) => {
    const paid = amountPaidMinor(order.payments);
    return [
      order.orderNumber,
      accraDay(order.createdAt),
      order.fullName,
      order.phone,
      order.email,
      order.deliveryMethod,
      order.fulfillmentStatus,
      order.paymentStatus,
      (order.subtotalMinor / 100).toFixed(2),
      (order.shippingMinor / 100).toFixed(2),
      (order.totalMinor / 100).toFixed(2),
      (paid / 100).toFixed(2),
      (balanceDueMinor(order.totalMinor, order.payments) / 100).toFixed(2),
      order.isTest ? "yes" : "no",
    ].map(csvCell).join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
