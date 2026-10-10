"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { productInputSchema, variantInputSchema } from "@/lib/validations";
import { updateFulfillment } from "@/lib/orders/store";
import { fulfillmentStatuses, type FulfillmentStatus } from "@/lib/orders/transitions";
import { refundPaystackTransaction } from "@/lib/payments/paystack";
import { getOrderById } from "@/lib/orders/store";

function needDb() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Admin mutations require a configured Supabase service role.");
  }
  const admin = createServiceClient();
  if (!admin) throw new Error("Admin client unavailable.");
  return admin;
}

export async function saveSettingsAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  await requireAdmin();
  const admin = needDb();
  const entries = [
    ["announcement", formData.get("announcement")],
    ["contact_email", formData.get("contactEmail")],
    ["contact_phone", formData.get("contactPhone")],
    ["instagram_url", formData.get("instagramUrl")],
    ["location", formData.get("location")],
    ["tiktok_url", formData.get("tiktokUrl")],
    ["snapchat_handle", formData.get("snapchatHandle")],
    ["momo_number", formData.get("momoNumber")],
    ["momo_merchant_id", formData.get("momoMerchantId")],
    ["bank_name", formData.get("bankName")],
    ["bank_account", formData.get("bankAccount")],
    ["about_story", formData.get("aboutStory")],
  ] as const;
  for (const [key, value] of entries) {
    await admin.from("store_settings").upsert({ key, value: String(value ?? "") });
  }
  revalidatePath("/");
  return { ok: true as const, message: "Settings saved." };
}

export async function saveProductAction(_prev: { error?: string; ok?: boolean; message?: string; id?: string } | null, formData: FormData) {
  await requireAdmin();
  const admin = needDb();
  const parsed = productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    brand: formData.get("brand"),
    concentration: formData.get("concentration") || undefined,
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    status: formData.get("status"),
    topNotes: String(formData.get("topNotes") ?? ""),
    heartNotes: String(formData.get("heartNotes") ?? ""),
    baseNotes: String(formData.get("baseNotes") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const id = String(formData.get("id") || crypto.randomUUID());
  const { error } = await admin.from("products").upsert({
    id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    brand: parsed.data.brand,
    concentration: parsed.data.concentration ?? null,
    category_id: parsed.data.categoryId,
    featured: parsed.data.featured,
    status: parsed.data.status,
    is_demonstration: true,
    top_notes: parsed.data.topNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
    heart_notes: parsed.data.heartNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
    base_notes: parsed.data.baseNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
  });
  if (error) return { error: error.message };

  const variantParsed = variantInputSchema.safeParse({
    sku: formData.get("sku"),
    label: formData.get("label"),
    sizeMl: formData.get("sizeMl") || undefined,
    priceMinor: formData.get("priceMinor"),
    compareAtMinor: formData.get("compareAtMinor") || undefined,
    stock: formData.get("stock"),
  });
  if (variantParsed.success) {
    const variantId = String(formData.get("variantId") || crypto.randomUUID());
    await admin.from("product_variants").upsert({
      id: variantId,
      product_id: id,
      sku: variantParsed.data.sku,
      label: variantParsed.data.label,
      size_ml: variantParsed.data.sizeMl ?? null,
      price_minor: variantParsed.data.priceMinor,
      compare_at_minor: variantParsed.data.compareAtMinor ?? null,
      stock: variantParsed.data.stock,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true as const, message: "Product saved.", id };
}

export async function updateFulfillmentAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const next = String(formData.get("status")) as FulfillmentStatus;
  if (!fulfillmentStatuses.includes(next)) return { error: "Invalid status." };
  const tracking = String(formData.get("trackingNumber") ?? "") || undefined;
  try {
    await updateFulfillment(orderId, next, tracking);
    revalidatePath("/admin/orders");
    return { ok: true as const, message: "Fulfillment updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function refundOrderAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const order = await getOrderById(orderId);
  if (!order?.paystackReference) return { error: "No Paystack reference on this order." };
  if (order.paymentStatus !== "paid") return { error: "Only paid orders can be refunded through Paystack." };
  try {
    await refundPaystackTransaction({ transactionReference: order.paystackReference });
    return { ok: true as const, message: "Refund requested with Paystack. Status updates via webhook." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Refund failed." };
  }
}
