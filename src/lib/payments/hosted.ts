import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import type { StoreOrder } from "@/lib/orders/types";
import { generateMoolrePaymentLink, isMoolreConfigured } from "@/lib/payments/moolre";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/payments/paystack";

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error;
}

export async function redirectToHostedPayment(order: StoreOrder): Promise<never> {
  const confirmationPath = `/checkout/confirmation?order=${order.id}`;
  const confirmationUrl = `${env.siteUrl}${confirmationPath}`;

  if (order.paymentStatus === "paid") {
    redirect(confirmationPath);
  }

  if (isMoolreConfigured() && order.paystackReference) {
    try {
      const payment = await generateMoolrePaymentLink({
        amountMinor: order.totalMinor,
        email: order.email,
        externalRef: order.paystackReference,
        callbackUrl: `${env.siteUrl}/api/webhooks/moolre`,
        redirectUrl: confirmationUrl,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });
      if (payment.configured) redirect(payment.authorizationUrl);
    } catch (error) {
      if (isRedirectError(error)) throw error;
    }
  }

  if (isPaystackConfigured() && order.paystackReference) {
    try {
      const payment = await initializePaystackTransaction({
        email: order.email,
        amountMinor: order.totalMinor,
        reference: order.paystackReference,
        callbackUrl: confirmationUrl,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });
      if (payment.configured) redirect(payment.authorization_url);
    } catch (error) {
      if (isRedirectError(error)) throw error;
    }
  }

  redirect(confirmationPath);
}
