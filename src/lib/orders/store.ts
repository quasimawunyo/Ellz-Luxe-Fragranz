import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/json-cookie";
import { decrementStock } from "@/lib/inventory";
import { getVariantById, setDemoStock } from "@/lib/catalog/queries";
import { stockLimitMessage } from "@/lib/stock";
import { resolveCart, clearCart } from "@/lib/cart/store";
import { getStoreSettings } from "@/lib/catalog/queries";
import { orderGrandTotal } from "@/lib/money";
import type { CheckoutInput } from "@/lib/validations";
import type { StoreOrder } from "@/lib/orders/types";
import {
  assertFulfillmentTransition,
  normalizeFulfillmentStatus,
  type FulfillmentStatus,
  type PaymentStatus,
} from "@/lib/orders/transitions";
import type { OrderEvent, OrderPayment } from "@/lib/orders/types";
import {
  getMoolrePaymentStatus,
  isMoolreConfigured,
  moolreAmountMatches,
  moolrePaymentSucceeded,
} from "@/lib/payments/moolre";
import { isPaystackConfigured } from "@/lib/payments/paystack";
import { rememberPlacedOrderId } from "@/lib/orders/placed-cookie";
import { normalizeOrderNumber, phonesMatch } from "@/lib/orders/lookup";
import { ghanaWaDigits } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

const ORDERS_COOKIE = "elf_orders";

async function demoOrders() {
  const rows = await readJsonCookie<StoreOrder[]>(ORDERS_COOKIE, []);
  return rows.map((order) => ({
    ...order,
    fulfillmentStatus: normalizeFulfillmentStatus(order.fulfillmentStatus, order.deliveryMethod),
    isTest: order.isTest ?? false,
    awaitingReview: order.awaitingReview ?? false,
    payments: order.payments ?? [],
    events: order.events ?? [],
  }));
}

async function saveDemoOrders(orders: StoreOrder[]) {
  await writeJsonCookie(ORDERS_COOKIE, orders);
}

function mapOrder(row: {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  region: string;
  locality: string;
  address_line: string;
  delivery_method: string;
  notes: string | null;
  currency_code: string;
  subtotal_minor: number;
  shipping_minor: number;
  total_minor: number;
  order_status: StoreOrder["orderStatus"];
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  tracking_number: string | null;
  needs_attention?: boolean | null;
  attention_note?: string | null;
  stock_applied?: boolean | null;
  is_test?: boolean | null;
  awaiting_review?: boolean | null;
  created_at: string;
}, items: StoreOrder["items"], paystackReference: string | null, paymentProvider: string | null = null, payments: OrderPayment[] = [], events: OrderEvent[] = []): StoreOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    region: row.region,
    locality: row.locality,
    addressLine: row.address_line,
    deliveryMethod: row.delivery_method,
    notes: row.notes,
    currencyCode: row.currency_code,
    subtotalMinor: row.subtotal_minor,
    shippingMinor: row.shipping_minor,
    totalMinor: row.total_minor,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: normalizeFulfillmentStatus(row.fulfillment_status, row.delivery_method),
    trackingNumber: row.tracking_number,
    needsAttention: Boolean(row.needs_attention),
    attentionNote: row.attention_note ?? null,
    stockApplied: Boolean(row.stock_applied),
    isTest: Boolean(row.is_test),
    awaitingReview: Boolean(row.awaiting_review),
    createdAt: row.created_at,
    items,
    payments,
    events,
    paystackReference,
    paymentProvider,
  };
}

export async function createPendingOrder(input: CheckoutInput, userId: string | null) {
  const cart = await resolveCart();
  if (!cart.lines.length) {
    throw new Error("Your cart is empty.");
  }
  const settings = await getStoreSettings();
  const method = settings.deliveryMethods.find((item) => item.id === input.deliveryMethodId);
  if (!method) throw new Error("Choose a valid delivery method.");

  for (const line of cart.lines) {
    const live = await getVariantById(line.variantId);
    if (!live) throw new Error("A cart item is no longer available.");
    if (live.variant.priceMinor !== line.unitMinor) {
      throw new Error("A price changed. Refresh your cart and try again.");
    }
    if (live.variant.trackStock && line.quantity > live.variant.stockQuantity) {
      throw new Error(stockLimitMessage(live.product.name, live.variant.label, live.variant.stockQuantity));
    }
  }

  const subtotalMinor = cart.lines.reduce((sum, line) => sum + line.lineMinor, 0);
  const totalMinor = orderGrandTotal(subtotalMinor, method.amountMinor);
  const orderNumber = `ELF-${Date.now().toString(36).toUpperCase()}`;
  const reference = `elf_${crypto.randomUUID()}`;
  const provider = isMoolreConfigured() ? "moolre" : isPaystackConfigured() ? "paystack" : "manual";

  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) throw new Error("Database is not ready.");
    const { data, error } = await admin.rpc("checkout_create_order", {
      p_user_id: userId,
      p_email: input.email,
      p_full_name: input.fullName,
      p_phone: input.phone,
      p_region: input.region,
      p_locality: input.locality,
      p_address_line: input.addressLine,
      p_delivery_method: method.label,
      p_shipping_minor: method.amountMinor,
      p_notes: input.notes ?? null,
      p_items: cart.lines.map((line) => ({
        variant_id: line.variantId,
        quantity: line.quantity,
        product_name: line.productName,
        sku: line.sku,
        variant_label: line.label,
        unit_price_minor: line.unitMinor,
        product_id: line.productId,
      })),
    });
    if (error) throw new Error(error.message);
    const orderId = data as string;
    await admin.from("payments").insert({
      order_id: orderId,
      provider,
      provider_reference: reference,
      amount_minor: totalMinor,
      currency_code: settings.currencyCode,
      status: "pending",
    });
    await clearCart();
    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order could not be loaded.");
    await rememberPlacedOrderId(order.id);
    return order;
  }

  for (const line of cart.lines) {
    const live = await getVariantById(line.variantId);
    if (!live?.variant.trackStock) continue;
    await setDemoStock(line.variantId, decrementStock(live.variant.stockQuantity, line.quantity));
  }

  const order: StoreOrder = {
    id: crypto.randomUUID(),
    orderNumber,
    userId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
    region: input.region,
    locality: input.locality,
    addressLine: input.addressLine,
    deliveryMethod: method.label,
    notes: input.notes ?? null,
    currencyCode: settings.currencyCode,
    subtotalMinor,
    shippingMinor: method.amountMinor,
    totalMinor,
    orderStatus: "open",
    paymentStatus: "pending",
    fulfillmentStatus: "new",
    trackingNumber: null,
    needsAttention: false,
    attentionNote: null,
    stockApplied: false,
    isTest: false,
    awaitingReview: false,
    payments: [],
    events: [],
    createdAt: new Date().toISOString(),
    items: cart.lines.map((line) => ({
      productName: line.productName,
      sku: line.sku,
      variantLabel: line.label,
      quantity: line.quantity,
      unitPriceMinor: line.unitMinor,
      productId: line.productId,
      variantId: line.variantId,
    })),
    paystackReference: reference,
    paymentProvider: provider,
  };
  const orders = await demoOrders();
  orders.unshift(order);
  await saveDemoOrders(orders);
  await clearCart();
  await rememberPlacedOrderId(order.id);
  return order;
}

function mapPayment(row: {
  id: string;
  provider: string;
  method?: string | null;
  provider_reference: string;
  amount_minor: number;
  status: PaymentStatus;
  note?: string | null;
  link_url?: string | null;
  created_at: string;
}): OrderPayment {
  return {
    id: row.id,
    provider: row.provider,
    method: row.method ?? null,
    reference: row.provider_reference,
    amountMinor: row.amount_minor,
    status: row.status,
    note: row.note ?? null,
    linkUrl: row.link_url ?? null,
    createdAt: row.created_at,
  };
}

function mapEvent(row: {
  id: string;
  event_type: string;
  from_value?: string | null;
  to_value?: string | null;
  note?: string | null;
  actor_email?: string | null;
  created_at: string;
}): OrderEvent {
  return {
    id: row.id,
    eventType: row.event_type,
    fromValue: row.from_value ?? null,
    toValue: row.to_value ?? null,
    note: row.note ?? null,
    actorEmail: row.actor_email ?? null,
    createdAt: row.created_at,
  };
}

export async function recordOrderEvent(input: {
  orderId: string;
  eventType: "fulfilment" | "payment" | "delivery_fee" | "test" | "refund" | "note";
  fromValue?: string | null;
  toValue?: string | null;
  note?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
}) {
  const admin = createServiceClient();
  if (!admin) return;
  await admin.from("order_events").insert({
    order_id: input.orderId,
    event_type: input.eventType,
    from_value: input.fromValue ?? null,
    to_value: input.toValue ?? null,
    note: input.note ?? null,
    created_by: input.actorId ?? null,
    actor_email: input.actorEmail ?? null,
  });
}

export async function getOrderById(id: string) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      const { data: row } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
      if (!row) return null;
      const { data: items } = await admin.from("order_items").select("*").eq("order_id", id);
      const [{ data: paymentRows }, { data: eventRows }] = await Promise.all([
        admin.from("payments").select("*").eq("order_id", id).order("created_at", { ascending: true }),
        admin.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: true }),
      ]);
      const payments = (paymentRows ?? []).map(mapPayment);
      const events = (eventRows ?? []).map(mapEvent);
      const latest = payments.at(-1);
      return mapOrder(
        row,
        (items ?? []).map((item) => ({
          productName: item.product_name,
          sku: item.sku,
          variantLabel: item.variant_label,
          quantity: item.quantity,
          unitPriceMinor: item.unit_price_minor,
          productId: item.product_id,
          variantId: item.variant_id,
        })),
        latest?.reference ?? null,
        latest?.provider ?? null,
        payments,
        events,
      );
    }
  }
  return (await demoOrders()).find((order) => order.id === id) ?? null;
}

export async function getOrderByPaymentReference(reference: string) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) return null;
    const { data: payment } = await admin
      .from("payments")
      .select("order_id")
      .eq("provider_reference", reference)
      .maybeSingle();
    if (!payment) return null;
    return getOrderById(payment.order_id);
  }
  return (await demoOrders()).find((order) => order.paystackReference === reference) ?? null;
}

export async function listOrdersByPhone(phone: string) {
  const needle = ghanaWaDigits(phone);
  const last9 = needle.slice(-9);
  if (!/^\d{9}$/.test(last9)) return [];
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      const { data } = await admin
        .from("orders")
        .select("id, phone, is_test, created_at")
        .ilike("phone", `%${last9}%`)
        .order("created_at", { ascending: false })
        .limit(40);
      const ids = (data ?? [])
        .filter((row) => !row.is_test && phonesMatch(String(row.phone ?? ""), phone))
        .slice(0, 8)
        .map((row) => row.id as string);
      const orders = [];
      for (const id of ids) {
        const order = await getOrderById(id);
        if (order && !order.isTest) orders.push(order);
      }
      return orders;
    }
  }
  return (await demoOrders())
    .filter((order) => !order.isTest && phonesMatch(order.phone, phone))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
}

export async function getOrderByNumber(orderNumber: string) {
  const needle = normalizeOrderNumber(orderNumber);
  if (!needle) return null;
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      const { data: row } = await admin.from("orders").select("id").eq("order_number", needle).maybeSingle();
      if (!row) return null;
      return getOrderById(row.id);
    }
  }
  return (await demoOrders()).find((order) => normalizeOrderNumber(order.orderNumber) === needle) ?? null;
}

export async function listOrders(filter?: { userId?: string; email?: string }) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      let query = admin.from("orders").select("*").order("created_at", { ascending: false });
      if (filter?.userId) query = query.eq("user_id", filter.userId);
      const { data } = await query;
      const orders: StoreOrder[] = [];
      for (const row of data ?? []) {
        const loaded = await getOrderById(row.id);
        if (loaded) orders.push(loaded);
      }
      return orders;
    }
  }
  let orders = await demoOrders();
  if (filter?.userId) orders = orders.filter((order) => order.userId === filter.userId);
  return orders;
}

export async function settlePaidOrderStock(orderId: string) {
  await applyOnlineSale(orderId);
}

async function applyOnlineSale(orderId: string) {
  const admin = createServiceClient();
  if (!admin) return;
  const { data: orderRow } = await admin
    .from("orders")
    .select("stock_applied")
    .eq("id", orderId)
    .maybeSingle();
  if (!orderRow || orderRow.stock_applied) return;
  const order = await getOrderById(orderId);
  if (!order) return;
  if (order.isTest) {
    await admin.from("orders").update({ stock_applied: true }).eq("id", orderId);
    return;
  }
  const short: string[] = [];
  for (const item of order.items) {
    if (!item.variantId) continue;
    const { error } = await admin.rpc("adjust_stock", {
      p_variant_id: item.variantId,
      p_change: -item.quantity,
      p_reason: "sale_online",
      p_order_id: orderId,
      p_note: order.orderNumber,
      p_created_by: null,
    });
    if (error && /insufficient_stock/i.test(error.message)) {
      short.push(`${item.productName} (${item.variantLabel})`);
      continue;
    }
    if (error) throw new Error(error.message);
  }
  await admin
    .from("orders")
    .update({
      stock_applied: true,
      ...(short.length
        ? {
            needs_attention: true,
            attention_note: `Paid, but not enough stock for ${short.join(", ")}.`,
          }
        : {}),
    })
    .eq("id", orderId);
}

export async function returnStockForOrder(orderId: string, actorId: string | null) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.isTest || !order.stockApplied) return false;
  const admin = createServiceClient();
  if (!admin) return false;
  for (const item of order.items) {
    if (!item.variantId) continue;
    const { error } = await admin.rpc("adjust_stock", {
      p_variant_id: item.variantId,
      p_change: item.quantity,
      p_reason: "order_cancelled",
      p_order_id: orderId,
      p_note: "Returned to stock",
      p_created_by: actorId,
    });
    if (error) throw new Error(error.message);
  }
  return true;
}

export async function markOrderPaid(
  reference: string,
  eventId: string,
  expectedAmountMinor?: number,
  payerNetwork?: string | null,
) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) return null;
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("provider_reference", reference)
      .maybeSingle();
    if (!payment) return null;
    if (
      typeof expectedAmountMinor === "number" &&
      payment.amount_minor !== expectedAmountMinor
    ) {
      return null;
    }
    if (payerNetwork) {
      await admin.from("payments").update({ payer_network: payerNetwork }).eq("id", payment.id);
    }
    if (payment.status !== "paid") {
      await admin
        .from("payments")
        .update({ status: "paid", raw_event_id: eventId })
        .eq("id", payment.id)
        .eq("status", "pending");
      await admin
        .from("orders")
        .update({ payment_status: "paid", order_status: "completed" })
        .eq("id", payment.order_id);
      await recordOrderEvent({
        orderId: payment.order_id,
        eventType: "payment",
        fromValue: payment.status,
        toValue: "paid",
        note: `Payment ${payment.provider_reference} confirmed.`,
        actorEmail: payment.provider === "moolre" ? "Moolre" : payment.provider,
      });
    }
    await applyOnlineSale(payment.order_id);
    try {
      revalidatePath("/", "layout");
    } catch {
      // A webhook can confirm payment outside a page render. The sale is already recorded.
    }
    return payment.order_id;
  }
  const orders = await demoOrders();
  const order = orders.find((item) => item.paystackReference === reference);
  if (!order) return null;
  if (typeof expectedAmountMinor === "number" && order.totalMinor !== expectedAmountMinor) {
    return null;
  }
  order.paymentStatus = "paid";
  order.orderStatus = "completed";
  await saveDemoOrders(orders);
  return order.id;
}

export async function confirmMoolreIfPaid(order: StoreOrder) {
  if (!isMoolreConfigured() || order.paymentStatus === "paid") return order;
  const checkout = order.payments.find(
    (payment) => payment.status === "pending" && payment.provider === "moolre" && payment.note !== "Delivery fee",
  );
  if (!checkout) return order;
  const live = await getMoolrePaymentStatus(checkout.reference);
  if (!moolrePaymentSucceeded(live) || !live) return order;
  if (!moolreAmountMatches(live.amount ?? live.value, checkout.amountMinor)) return order;
  await markOrderPaid(checkout.reference, String(live.transactionid ?? checkout.reference));
  return (await getOrderById(order.id)) ?? order;
}

export async function markWhatsAppOrderPaid(orderId: string, actorId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.paymentStatus === "paid") {
    if (isSupabaseAdminConfigured()) await applyOnlineSale(orderId);
    return (await getOrderById(orderId)) ?? order;
  }
  if (order.paymentStatus !== "pending") {
    throw new Error(`Cannot mark this order paid from ${order.paymentStatus}.`);
  }
  const provider = order.paymentProvider ?? "manual";
  if (provider === "moolre" || provider === "paystack") {
    throw new Error("This order waits for Moolre or Paystack to confirm payment. Do not mark it paid by hand.");
  }

  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) throw new Error("Database is not ready.");
    await admin
      .from("payments")
      .update({ status: "paid", raw_event_id: `whatsapp:${actorId}` })
      .eq("order_id", orderId)
      .eq("status", "pending");
    await admin
      .from("orders")
      .update({ payment_status: "paid", order_status: "completed" })
      .eq("id", orderId)
      .eq("payment_status", "pending");
    await applyOnlineSale(orderId);
    const updated = await getOrderById(orderId);
    if (!updated) throw new Error("Order could not be loaded.");
    return updated;
  }

  const orders = await demoOrders();
  const next = orders.find((item) => item.id === orderId);
  if (!next) throw new Error("Order not found.");
  next.paymentStatus = "paid";
  next.orderStatus = "completed";
  await saveDemoOrders(orders);
  return next;
}

export async function updateFulfillment(
  orderId: string,
  next: FulfillmentStatus,
  trackingNumber?: string,
  options?: { returnToStock?: boolean; actorId?: string | null; actorEmail?: string | null; note?: string | null },
) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  assertFulfillmentTransition(order.fulfillmentStatus, next);
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) throw new Error("Database is not ready.");
    await admin
      .from("orders")
      .update({
        fulfillment_status: next,
        tracking_number: trackingNumber ?? order.trackingNumber,
        order_status: next === "cancelled" ? "cancelled" : order.orderStatus,
      })
      .eq("id", orderId);
    await recordOrderEvent({
      orderId,
      eventType: next === "cancelled" ? "fulfilment" : "fulfilment",
      fromValue: order.fulfillmentStatus,
      toValue: next,
      note: options?.note ?? null,
      actorId: options?.actorId ?? null,
      actorEmail: options?.actorEmail ?? null,
    });
    if (options?.returnToStock && next === "cancelled" && !order.isTest) {
      await returnStockForOrder(orderId, options.actorId ?? null);
    }
    return getOrderById(orderId);
  }
  order.fulfillmentStatus = next;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (next === "cancelled") order.orderStatus = "cancelled";
  const orders = await demoOrders();
  const index = orders.findIndex((item) => item.id === orderId);
  if (index >= 0) orders[index] = order;
  await saveDemoOrders(orders);
  return order;
}
