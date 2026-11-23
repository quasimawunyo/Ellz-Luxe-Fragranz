"use server";

import { updateTag } from "next/cache";
import { customerCheckoutError, validationState } from "@/lib/forms/errors";
import { checkoutSchema } from "@/lib/validations";
import { createPendingOrder } from "@/lib/orders/store";
import { getAuthContext } from "@/lib/auth/session";
import { notifyAnnexOfOrder } from "@/lib/notify/order";
import { redirectToHostedPayment } from "@/lib/payments/hosted";

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
  if (!parsed.success) return validationState(parsed.error);

  try {
    const auth = await getAuthContext();
    const order = await createPendingOrder(parsed.data, auth.user?.id ?? null);
    updateTag("storefront");
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
    return { error: error instanceof Error ? customerCheckoutError(error.message) : "We could not place the order. Please try again." };
  }
  return { error: "Checkout failed." };
}
