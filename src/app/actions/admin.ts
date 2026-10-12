"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { productInputSchema, variantInputSchema } from "@/lib/validations";
import { markWhatsAppOrderPaid, updateFulfillment } from "@/lib/orders/store";
import { fulfillmentStatuses, type FulfillmentStatus } from "@/lib/orders/transitions";
import { refundPaystackTransaction } from "@/lib/payments/paystack";
import { getOrderById } from "@/lib/orders/store";
import { minorFromCedisInput } from "@/lib/money";
import type { DeliveryMethod } from "@/lib/catalog/types";

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
    ["shipping_note", formData.get("shippingNote")],
    ["returns_note", formData.get("returnsNote")],
    ["privacy_note", formData.get("privacyNote")],
    ["terms_note", formData.get("termsNote")],
  ] as const;
  for (const [key, value] of entries) {
    await admin.from("store_settings").upsert({ key, value: String(value ?? "") });
  }
  const deliveryMethods: DeliveryMethod[] = [
    {
      id: "accra",
      label: "Greater Accra delivery",
      amountMinor: 0,
      description:
        String(formData.get("deliveryAccraNote") ?? "").trim() ||
        "Fee depends on your locality. We quote it on WhatsApp after you place the order.",
    },
    {
      id: "national",
      label: "Rest of Ghana",
      amountMinor: 0,
      description:
        String(formData.get("deliveryNationalNote") ?? "").trim() ||
        "Fee depends on your town. We quote it on WhatsApp after you place the order.",
    },
    {
      id: "pickup",
      label: "Pickup at Ells Luxe Annex",
      amountMinor: 0,
      description: String(formData.get("deliveryPickupNote") ?? "").trim() || "Collect your order at Ells Luxe Annex.",
    },
  ];
  await admin.from("store_settings").upsert({ key: "delivery_methods", value: deliveryMethods });
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/faq");
  revalidatePath("/legal/privacy");
  revalidatePath("/legal/terms");
  revalidatePath("/legal/shipping");
  revalidatePath("/legal/returns");
  revalidatePath("/admin/settings");
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
    newArrival: formData.get("newArrival") === "on",
    status: formData.get("status"),
    topNotes: String(formData.get("topNotes") ?? ""),
    heartNotes: String(formData.get("heartNotes") ?? ""),
    baseNotes: String(formData.get("baseNotes") ?? ""),
    isDemonstration: formData.get("isDemonstration") === "on",
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    imageAlt: String(formData.get("imageAlt") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const creating = !String(formData.get("id") || "");
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
    new_arrival: parsed.data.newArrival,
    status: parsed.data.status,
    is_demonstration: parsed.data.isDemonstration,
    top_notes: parsed.data.topNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
    heart_notes: parsed.data.heartNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
    base_notes: parsed.data.baseNotes?.split(",").map((n) => n.trim()).filter(Boolean) ?? [],
  });
  if (error) return { error: error.message };

  const priceMinor = minorFromCedisInput(formData.get("priceCedis"));
  const compareAtMinor = minorFromCedisInput(formData.get("compareAtCedis"));
  if (priceMinor === null) return { error: "Enter a price in Ghana cedis (for example 280.00)." };
  const variantParsed = variantInputSchema.safeParse({
    sku: formData.get("sku"),
    label: formData.get("label"),
    sizeMl: formData.get("sizeMl") || undefined,
    priceMinor,
    compareAtMinor: compareAtMinor ?? undefined,
    stock: formData.get("stock"),
  });
  if (!variantParsed.success) return { error: variantParsed.error.issues[0]?.message ?? "Check the size, SKU, and stock." };
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

  let imageUrl = parsed.data.imageUrl;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) return { error: "Product photos must be 2 MB or smaller." };
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return { error: "Use a JPEG, PNG, or WebP photo." };
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${id}/${crypto.randomUUID()}.${extension}`;
    const upload = await admin.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (upload.error) return { error: upload.error.message };
    imageUrl = admin.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }
  if (imageUrl) {
    const imageId = String(formData.get("imageId") || `img-${id}`);
    await admin.from("product_images").upsert({
      id: imageId,
      product_id: id,
      url: imageUrl,
      alt: parsed.data.imageAlt || parsed.data.name,
      position: 0,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  revalidatePath("/");
  if (creating) redirect(`/admin/products/${id}`);
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

export async function markOrderPaidAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  try {
    await markWhatsAppOrderPaid(orderId, auth.user?.id ?? "admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    return { ok: true as const, message: "Marked paid. This records that you received payment on WhatsApp." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not mark paid." };
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
