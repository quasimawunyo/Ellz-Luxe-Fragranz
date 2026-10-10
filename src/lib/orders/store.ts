import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/json-cookie";
import { decrementStock } from "@/lib/inventory";
import { getVariantById, setDemoStock } from "@/lib/catalog/queries";
import { resolveCart, clearCart } from "@/lib/cart/store";
import { getStoreSettings } from "@/lib/catalog/queries";
import { orderGrandTotal } from "@/lib/money";
import type { CheckoutInput } from "@/lib/validations";
import type { StoreOrder } from "@/lib/orders/types";
import {
  assertFulfillmentTransition,
  type FulfillmentStatus,
  type PaymentStatus,
} from "@/lib/orders/transitions";
import {
  getMoolrePaymentStatus,
  isMoolreConfigured,
  moolreAmountMatches,
  moolrePaymentSucceeded,
} from "@/lib/payments/moolre";
import { isPaystackConfigured } from "@/lib/payments/paystack";

const ORDERS_COOKIE = "elf_orders";

async function demoOrders() {
  return readJsonCookie<StoreOrder[]>(ORDERS_COOKIE, []);
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
  created_at: string;
}, items: StoreOrder["items"], paystackReference: string | null): StoreOrder {
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
    fulfillmentStatus: row.fulfillment_status,
    trackingNumber: row.tracking_number,
    createdAt: row.created_at,
    items,
    paystackReference,
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
    if (line.quantity > live.variant.stock) {
      throw new Error(`${live.product.name} does not have enough stock.`);
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
    return order;
  }

  for (const line of cart.lines) {
    const live = await getVariantById(line.variantId);
    if (!live) throw new Error("A cart item is no longer available.");
    await setDemoStock(line.variantId, decrementStock(live.variant.stock, line.quantity));
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
    fulfillmentStatus: "unfulfilled",
    trackingNumber: null,
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
  };
  const orders = await demoOrders();
  orders.unshift(order);
  await saveDemoOrders(orders);
  await clearCart();
  return order;
}

export async function getOrderById(id: string) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      const { data: row } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
      if (!row) return null;
      const { data: items } = await admin.from("order_items").select("*").eq("order_id", id);
      const { data: payment } = await admin
        .from("payments")
        .select("provider_reference")
        .eq("order_id", id)
        .maybeSingle();
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
        payment?.provider_reference ?? null,
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

export async function getOrderByNumber(orderNumber: string) {
  const orders = await listOrders();
  return orders.find((order) => order.orderNumber === orderNumber) ?? null;
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

export async function markOrderPaid(reference: string, eventId: string) {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (!admin) return null;
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("provider_reference", reference)
      .maybeSingle();
    if (!payment) return null;
    if (payment.status === "paid") return payment.order_id;
    await admin
      .from("payments")
      .update({ status: "paid", raw_event_id: eventId })
      .eq("id", payment.id)
      .eq("status", "pending");
    await admin
      .from("orders")
      .update({ payment_status: "paid", order_status: "completed" })
      .eq("id", payment.order_id);
    return payment.order_id;
  }
  const orders = await demoOrders();
  const order = orders.find((item) => item.paystackReference === reference);
  if (!order) return null;
  order.paymentStatus = "paid";
  order.orderStatus = "completed";
  await saveDemoOrders(orders);
  return order.id;
}

export async function confirmMoolreIfPaid(order: StoreOrder) {
  if (!isMoolreConfigured() || order.paymentStatus === "paid" || !order.paystackReference) {
    return order;
  }
  const live = await getMoolrePaymentStatus(order.paystackReference);
  if (!moolrePaymentSucceeded(live) || !live) return order;
  if (!moolreAmountMatches(live.amount ?? live.value, order.totalMinor)) return order;
  await markOrderPaid(order.paystackReference, String(live.transactionid ?? order.paystackReference));
  return (await getOrderById(order.id)) ?? order;
}

export async function updateFulfillment(
  orderId: string,
  next: FulfillmentStatus,
  trackingNumber?: string,
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
