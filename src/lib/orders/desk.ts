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
  const testsOn = query.tests === "1" || query.tests === "only" || query.tests === "suggest";
  return !query.view && !query.q && !query.payment && !query.fulfilment && !query.method && !query.from && !query.to && !testsOn && !query.fee && !query.attention && !query.review;
}

export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length > 9 ? digits.slice(-9) : digits;
}

export function looksLikeTest(
  order: { isTest: boolean; email: string; phone: string; totalMinor: number },
  shop: { email: string; phone: string },
) {
  if (order.isTest) return false;
  const email = order.email.trim().toLowerCase();
  const shopEmail = shop.email.trim().toLowerCase();
  if (email && shopEmail && email === shopEmail) return true;
  const phone = phoneKey(order.phone);
  const shopPhone = phoneKey(shop.phone);
  if (phone && shopPhone && phone === shopPhone) return true;
  return order.totalMinor < 5000;
}

function accraDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function orderMatchesQuery(order: { orderNumber: string; fullName: string; phone: string }, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const needleDigits = query.replace(/\D/g, "");
  const phone = order.phone.replace(/\D/g, "");
  return (
    order.orderNumber.toLowerCase().includes(needle) ||
    order.fullName.toLowerCase().includes(needle) ||
    order.phone.toLowerCase().includes(needle) ||
    (needleDigits.length >= 3 && phone.includes(needleDigits))
  );
}

export function filterOrders(orders: StoreOrder[], query: OrderListQuery, shop?: { email: string; phone: string }) {
  const queue = isDefaultOrderQueue(query);
  const shopContact = shop ?? { email: "", phone: "" };
  return orders
    .filter((order) => {
      if (query.tests === "suggest") return looksLikeTest(order, shopContact);
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
      if (query.q && !orderMatchesQuery(order, query.q)) return false;
      const day = accraDay(order.createdAt);
      if (query.from && day < query.from) return false;
      if (query.to && day > query.to) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function orderListHeading(query: OrderListQuery) {
  if (query.tests === "suggest") return "Orders that look like tests";
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
    "Coupon",
    "Discount",
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
      order.couponCode ?? "",
      ((order.discountMinor ?? 0) / 100).toFixed(2),
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
