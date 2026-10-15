"use server";

import { headers } from "next/headers";
import { checkoutSchema } from "@/lib/validations";
import { createPendingOrder } from "@/lib/orders/store";
import { getAuthContext } from "@/lib/auth/session";
import { notifyAnnexOfOrder } from "@/lib/notify/order";
import { redirectToHostedPayment } from "@/lib/payments/hosted";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/http/client-ip";

export async function placeOrderAction(_prev: { error?: string } | null, formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    locality: formData.get("locality"),
    addressLine: formData.get("addressLine"),
    deliveryMethodId: formData.get("deliveryMethodId"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!(await rateLimit(`checkout:${ip}`, 5, 10 * 60_000)).ok) {
    return { error: "Please wait before placing another order." };
  }

  try {
    const auth = await getAuthContext();
    const order = await createPendingOrder(parsed.data, auth.user?.id ?? null);
    try {
      await notifyAnnexOfOrder(order);
    } catch {
      /* Annex ping must not block checkout. */
    }
    await redirectToHostedPayment(order);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Checkout failed." };
  }
  return { error: "Checkout failed." };
}
