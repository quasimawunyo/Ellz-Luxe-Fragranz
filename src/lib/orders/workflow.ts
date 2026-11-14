import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";
import { minorFromCedisInput, orderGrandTotal } from "@/lib/money";
import { notifyCustomerOfFulfilment } from "@/lib/notify/order";
import { generateMoolrePaymentLink, isMoolreConfigured } from "@/lib/payments/moolre";
import { amountPaidMinor, balanceDueMinor } from "@/lib/orders/desk";
import { getOrderById, recordOrderEvent, returnStockForOrder, settlePaidOrderStock, updateFulfillment } from "@/lib/orders/store";
import {
  customerEmailForFulfilment,
  isPickupOrder,
  manualPaymentMethods,
  nextFulfillmentStatus,
  type FulfillmentStatus,
  type ManualPaymentMethod,
} from "@/lib/orders/transitions";

function needAdmin() {
  const admin = createServiceClient();
  if (!admin) throw new Error("Database is not ready.");
  return admin;
}

export async function advanceOrder(orderId: string, actor: { id: string; email: string | null }, note: string | null, emailCustomer: boolean) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  const next = nextFulfillmentStatus(order.fulfillmentStatus, order.deliveryMethod);
  if (!next) throw new Error("This order has no next step.");
  const updated = await updateFulfillment(orderId, next, undefined, {
    actorId: actor.id,
    actorEmail: actor.email,
    note,
  });
  if (emailCustomer && updated && customerEmailForFulfilment(next)) {
    await notifyCustomerOfFulfilment(updated, next);
    await recordOrderEvent({
      orderId,
      eventType: "note",
      note: `Emailed the customer that the order is ${next.replaceAll("_", " ")}.`,
      actorId: actor.id,
      actorEmail: actor.email,
    });
  }
  return updated;
}

export async function cancelOrder(
  orderId: string,
  actor: { id: string; email: string | null },
  reason: string,
  returnToStock: boolean,
) {
  const trimmed = reason.trim();
  if (trimmed.length < 3) throw new Error("Enter a reason for cancelling.");
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  return updateFulfillment(orderId, "cancelled" as FulfillmentStatus, undefined, {
    returnToStock,
    actorId: actor.id,
    actorEmail: actor.email,
    note: trimmed,
  });
}

export async function setDeliveryFee(orderId: string, actor: { id: string; email: string | null }, cedis: unknown) {
  const shippingMinor = minorFromCedisInput(cedis);
  if (shippingMinor === null) throw new Error("Enter the delivery fee in Ghana cedis.");
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (isPickupOrder(order.deliveryMethod) && shippingMinor !== 0) {
    throw new Error("Pickup stays at GH₵0.00.");
  }
  const admin = needAdmin();
  const totalMinor = orderGrandTotal(order.subtotalMinor, shippingMinor);
  const { error } = await admin
    .from("orders")
    .update({ shipping_minor: shippingMinor, total_minor: totalMinor })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  await recordOrderEvent({
    orderId,
    eventType: "delivery_fee",
    fromValue: String(order.shippingMinor),
    toValue: String(shippingMinor),
    note: `Delivery fee set to GH₵${(shippingMinor / 100).toFixed(2)}.`,
    actorId: actor.id,
    actorEmail: actor.email,
  });
  return getOrderById(orderId);
}

export async function requestDeliveryFeeLink(orderId: string, actor: { id: string; email: string | null }) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.isTest) throw new Error("Test orders do not take payment.");
  if (isPickupOrder(order.deliveryMethod)) throw new Error("Pickup has no delivery fee.");
  if (order.shippingMinor <= 0) throw new Error("Set the delivery fee first.");
  const balance = balanceDueMinor(order.totalMinor, order.payments);
  if (balance <= 0) throw new Error("Nothing is left to collect on this order.");
  const existing = order.payments.find(
    (payment) => payment.status === "pending" && payment.note === "Delivery fee" && payment.amountMinor === balance && payment.linkUrl,
  );
  if (existing?.linkUrl) return existing.linkUrl;
  if (!isMoolreConfigured()) {
    throw new Error("Moolre is not configured. Record a manual payment instead.");
  }
  const reference = `elf_fee_${crypto.randomUUID()}`;
  const link = await generateMoolrePaymentLink({
    amountMinor: balance,
    email: order.email,
    externalRef: reference,
    callbackUrl: `${env.siteUrl}/api/webhooks/moolre`,
    redirectUrl: `${env.siteUrl}/checkout/confirmation?order=${order.id}`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber, purpose: "delivery_fee" },
  });
  if (!link.configured) throw new Error("Moolre is not configured. Record a manual payment instead.");
  const admin = needAdmin();
  const { error } = await admin.from("payments").insert({
    order_id: orderId,
    provider: "moolre",
    method: "moolre",
    provider_reference: reference,
    amount_minor: balance,
    currency_code: order.currencyCode,
    status: "pending",
    note: "Delivery fee",
    link_url: link.authorizationUrl,
  });
  if (error) throw new Error(error.message);
  await recordOrderEvent({
    orderId,
    eventType: "payment",
    toValue: "pending",
    note: `Delivery fee payment link created for GH₵${(balance / 100).toFixed(2)}.`,
    actorId: actor.id,
    actorEmail: actor.email,
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return link.authorizationUrl;
}

export async function recordManualPayment(
  orderId: string,
  actor: { id: string; email: string | null },
  input: { method: string; reference: string; amount: unknown; note: string },
) {
  if (!manualPaymentMethods.includes(input.method as ManualPaymentMethod)) {
    throw new Error("Choose mobile money, cash, or card.");
  }
  const reference = input.reference.trim();
  const note = input.note.trim();
  if (reference.length < 2) throw new Error("Enter the payment reference.");
  if (note.length < 3) throw new Error("Enter a note for this payment.");
  const amountMinor = minorFromCedisInput(input.amount);
  if (amountMinor === null || amountMinor <= 0) throw new Error("Enter the amount received.");
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.isTest) throw new Error("Test orders do not take payment.");
  const admin = needAdmin();
  const { error } = await admin.from("payments").insert({
    order_id: orderId,
    provider: "manual",
    method: input.method,
    provider_reference: reference,
    amount_minor: amountMinor,
    currency_code: order.currencyCode,
    status: "paid",
    note,
    raw_event_id: `manual:${actor.id}`,
  });
  if (error) throw new Error(error.message.includes("duplicate") ? "That reference is already recorded." : error.message);
  const paidBefore = order.paymentStatus;
  const covered = amountPaidMinor(order.payments) + amountMinor;
  const settlesGoods = paidBefore === "pending" && covered >= order.subtotalMinor;
  if (settlesGoods) {
    await admin.from("orders").update({ payment_status: "paid", order_status: "completed" }).eq("id", orderId);
  }
  await recordOrderEvent({
    orderId,
    eventType: "payment",
    fromValue: paidBefore,
    toValue: settlesGoods ? "paid" : paidBefore,
    note: `${input.method.replaceAll("_", " ")} ${reference}. ${note}`,
    actorId: actor.id,
    actorEmail: actor.email,
  });
  if (settlesGoods) await settlePaidOrderStock(orderId);
  return getOrderById(orderId);
}

export async function recordRefund(
  orderId: string,
  actor: { id: string; email: string | null },
  note: string,
  returnToStock: boolean,
) {
  const trimmed = note.trim();
  if (trimmed.length < 3) throw new Error("Enter a note for this refund.");
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.paymentStatus !== "paid") throw new Error("Only a paid order can be marked refunded.");
  const admin = needAdmin();
  const reference = `refund_${crypto.randomUUID()}`;
  const refundedMinor =
    order.payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amountMinor, 0) ||
    order.totalMinor;
  await admin.from("payments").insert({
    order_id: orderId,
    provider: "manual",
    method: null,
    provider_reference: reference,
    amount_minor: refundedMinor,
    currency_code: order.currencyCode,
    status: "refunded",
    note: trimmed,
    raw_event_id: `refund:${actor.id}`,
  });
  await admin.from("orders").update({ payment_status: "refunded" }).eq("id", orderId);
  await recordOrderEvent({
    orderId,
    eventType: "refund",
    fromValue: order.paymentStatus,
    toValue: "refunded",
    note: trimmed,
    actorId: actor.id,
    actorEmail: actor.email,
  });
  if (returnToStock && !order.isTest) await returnStockForOrder(orderId, actor.id);
  return getOrderById(orderId);
}

export async function setOrderTest(orderId: string, actor: { id: string; email: string | null }, isTest: boolean) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (isTest && order.stockApplied) {
    await returnStockForOrder(orderId, actor.id);
  }
  const admin = needAdmin();
  await admin.from("orders").update({ is_test: isTest, awaiting_review: false }).eq("id", orderId);
  await recordOrderEvent({
    orderId,
    eventType: "test",
    fromValue: order.isTest ? "test" : "real",
    toValue: isTest ? "test" : "real",
    note: isTest ? "Marked as a test. It is hidden from the queue and left out of revenue and stock." : "Marked as a real sale.",
    actorId: actor.id,
    actorEmail: actor.email,
  });
  return getOrderById(orderId);
}

export async function dismissOrderReview(orderId: string, actor: { id: string; email: string | null }) {
  const admin = needAdmin();
  await admin.from("orders").update({ awaiting_review: false }).eq("id", orderId);
  await recordOrderEvent({
    orderId,
    eventType: "note",
    note: "Kept as a real sale.",
    actorId: actor.id,
    actorEmail: actor.email,
  });
  return getOrderById(orderId);
}
