"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/http/client-ip";
import { getOrderById, getOrderByNumber } from "@/lib/orders/store";
import { rememberPlacedOrderId, browserPlacedThisOrder } from "@/lib/orders/placed-cookie";
import { orderEmailMatches } from "@/lib/orders/lookup";
import { getAuthContext } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/auth/roles";
import { redirectToHostedPayment } from "@/lib/payments/hosted";

const trackSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
  email: z.email(),
});

const LOOKUP_MISS = "We could not find an order with those details.";

export async function trackOrderAction(_prev: { error?: string } | null, formData: FormData) {
  const parsed = trackSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the order number and email." };
  }

  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!(await rateLimit(`track:${ip}`, 8, 60_000)).ok) {
    return { error: "Please wait before trying again." };
  }

  const order = await getOrderByNumber(parsed.data.orderNumber);
  if (!order || !orderEmailMatches(order.email, parsed.data.email)) {
    return { error: LOOKUP_MISS };
  }

  await rememberPlacedOrderId(order.id);
  redirect(`/checkout/confirmation?order=${order.id}`);
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
