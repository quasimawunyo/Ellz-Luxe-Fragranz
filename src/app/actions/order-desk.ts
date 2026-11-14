"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  advanceOrder,
  cancelOrder,
  dismissOrderReview,
  recordManualPayment,
  recordRefund,
  requestDeliveryFeeLink,
  setDeliveryFee,
  setOrderTest,
} from "@/lib/orders/workflow";

function actor(auth: Awaited<ReturnType<typeof requireAdmin>>) {
  return { id: auth.user.id, email: auth.email };
}

function refresh(orderId: string) {
  updateTag("storefront");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

function failed(error: unknown) {
  return { error: error instanceof Error ? error.message : "That change could not be saved." };
}

export async function advanceOrderAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  try {
    const order = await advanceOrder(orderId, actor(auth), note, formData.get("emailCustomer") === "on");
    refresh(orderId);
    return { ok: true as const, message: order ? `Moved to ${order.fulfillmentStatus.replaceAll("_", " ")}.` : "Updated." };
  } catch (error) {
    return failed(error);
  }
}

export async function cancelOrderAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    const order = await cancelOrder(orderId, actor(auth), String(formData.get("reason") ?? ""), formData.get("returnToStock") === "on");
    refresh(orderId);
    const returned = formData.get("returnToStock") === "on";
    return {
      ok: true as const,
      message: returned && order?.stockApplied
        ? "Order cancelled. Bottles were returned to stock."
        : returned
          ? "Order cancelled. Stock was not held for this order, so nothing was returned."
          : "Order cancelled.",
    };
  } catch (error) {
    return failed(error);
  }
}

export async function setDeliveryFeeAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    await setDeliveryFee(orderId, actor(auth), formData.get("deliveryFee"));
    refresh(orderId);
    return { ok: true as const, message: "Delivery fee saved. The order total includes it." };
  } catch (error) {
    return failed(error);
  }
}

export async function requestDeliveryFeeLinkAction(_prev: { error?: string; ok?: boolean; message?: string; link?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    const link = await requestDeliveryFeeLink(orderId, actor(auth));
    refresh(orderId);
    return { ok: true as const, message: `Payment link ready. Copy it into WhatsApp: ${link}`, link };
  } catch (error) {
    return failed(error);
  }
}

export async function recordManualPaymentAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    await recordManualPayment(orderId, actor(auth), {
      method: String(formData.get("method") ?? ""),
      reference: String(formData.get("reference") ?? ""),
      amount: formData.get("amount"),
      note: String(formData.get("note") ?? ""),
    });
    refresh(orderId);
    return { ok: true as const, message: "Manual payment recorded." };
  } catch (error) {
    return failed(error);
  }
}

export async function recordRefundAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    await recordRefund(orderId, actor(auth), String(formData.get("note") ?? ""), formData.get("returnToStock") === "on");
    refresh(orderId);
    return { ok: true as const, message: "Refund recorded." };
  } catch (error) {
    return failed(error);
  }
}

export async function setOrderTestAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    const isTest = formData.get("isTest") === "on";
    await setOrderTest(orderId, actor(auth), isTest);
    refresh(orderId);
    return { ok: true as const, message: isTest ? "Marked as a test." : "Marked as a real sale." };
  } catch (error) {
    return failed(error);
  }
}

export async function dismissReviewAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  try {
    await dismissOrderReview(orderId, actor(auth));
    refresh(orderId);
    return { ok: true as const, message: "Kept as a real sale." };
  } catch (error) {
    return failed(error);
  }
}
