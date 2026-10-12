"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validations";
import { createPendingOrder } from "@/lib/orders/store";
import { getAuthContext } from "@/lib/auth/session";
import { generateMoolrePaymentLink, isMoolreConfigured } from "@/lib/payments/moolre";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/payments/paystack";
import { env } from "@/lib/env";
import { notifyAnnexOfOrder } from "@/lib/notify/order";

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

  try {
    const auth = await getAuthContext();
    const order = await createPendingOrder(parsed.data, auth.user?.id ?? null);
    try {
      await notifyAnnexOfOrder(order);
    } catch {
      /* Annex ping must not block checkout. */
    }
    const confirmationUrl = `${env.siteUrl}/checkout/confirmation?order=${order.id}`;
    if (isMoolreConfigured() && order.paystackReference) {
      const payment = await generateMoolrePaymentLink({
        amountMinor: order.totalMinor,
        email: order.email,
        externalRef: order.paystackReference,
        callbackUrl: `${env.siteUrl}/api/webhooks/moolre`,
        redirectUrl: confirmationUrl,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });
      if (payment.configured) {
        redirect(payment.authorizationUrl);
      }
    }
    if (isPaystackConfigured() && order.paystackReference) {
      const payment = await initializePaystackTransaction({
        email: order.email,
        amountMinor: order.totalMinor,
        reference: order.paystackReference,
        callbackUrl: confirmationUrl,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });
      if (payment.configured) {
        redirect(payment.authorization_url);
      }
    }
    redirect(`/checkout/confirmation?order=${order.id}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Checkout failed." };
  }
}
