"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { getOrderById, getOrderByNumber, listOrdersByPhone } from "@/lib/orders/store";
import { browserPlacedThisOrder } from "@/lib/orders/placed-cookie";
import { classifyTrackQuery, customerFulfilmentLine, customerPaymentLine } from "@/lib/orders/lookup";
import type { StoreOrder } from "@/lib/orders/types";
import { getAuthContext } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/auth/roles";
import { redirectToHostedPayment } from "@/lib/payments/hosted";

const LOOKUP_MISS = "We could not find an order with those details.";

export type TrackedOrder = {
  orderNumber: string;
  placed: string;
  fulfilment: string;
  payment: string;
  deliveryMethod: string;
  items: { name: string; size: string; quantity: number }[];
};

export type TrackLookupState = { error?: string; orders?: TrackedOrder[] } | null;

function publicTrack(order: StoreOrder): TrackedOrder {
  return {
    orderNumber: order.orderNumber,
    placed: new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(new Date(order.createdAt)),
    fulfilment: customerFulfilmentLine(order.fulfillmentStatus),
    payment: customerPaymentLine(order.paymentStatus),
    deliveryMethod: order.deliveryMethod,
    items: order.items.map((item) => ({
      name: item.productName,
      size: item.variantLabel,
      quantity: item.quantity,
    })),
  };
}

export async function trackOrderAction(_prev: TrackLookupState, formData: FormData): Promise<TrackLookupState> {
  const query = String(formData.get("query") ?? "").trim();
  const kind = classifyTrackQuery(query);
  if (kind === "invalid") {
    return { error: "Enter the phone number from checkout, or an order number such as ELF-…." };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(`track:${ip}`, 8, 60_000).ok) {
    return { error: "Please wait before trying again." };
  }

  const matches = kind === "phone" ? await listOrdersByPhone(query) : await getOrderByNumber(query).then((order) => (order && !order.isTest ? [order] : []));
  if (!matches.length) return { error: LOOKUP_MISS };
  return { orders: matches.map(publicTrack) };
}

export async function resumePaymentAction(_prev: { error?: string } | null, formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "Missing order." };

  const order = await getOrderById(orderId);
  if (!order) return { error: LOOKUP_MISS };

  const auth = await getAuthContext();
  const allowed =
    canViewOrder({
      orderUserId: order.userId,
      orderGuestEmail: order.email,
      actorUserId: auth.user?.id ?? null,
      actorEmail: auth.email,
      actorRole: auth.role,
    }) || (await browserPlacedThisOrder(order.id));
  if (!allowed) return { error: "This order is private." };
  if (order.paymentStatus === "paid") {
    redirect(`/checkout/confirmation?order=${order.id}`);
  }
  if (order.paymentStatus !== "pending") {
    return { error: "This order is not waiting for payment." };
  }

  try {
    await redirectToHostedPayment(order);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return { error: error instanceof Error ? error.message : "Could not open payment." };
  }
  return { error: "Could not open payment." };
}
