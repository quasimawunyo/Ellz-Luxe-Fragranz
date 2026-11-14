"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { productInputSchema, variantInputSchema } from "@/lib/validations";
import { getOrderById, markWhatsAppOrderPaid, returnStockForOrder, updateFulfillment } from "@/lib/orders/store";
import { fulfillmentStatuses, type FulfillmentStatus } from "@/lib/orders/transitions";
import { refundPaystackTransaction } from "@/lib/payments/paystack";
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
  updateTag("storefront");
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

const ADJUST_REASONS = ["restock", "correction", "damaged", "returned"] as const;

function stockErrorMessage(error: { message: string }) {
  if (/insufficient_stock/i.test(error.message)) return "That would take this bottle below zero.";
  if (/stock_quantity_locked/i.test(error.message)) return "Stock can only change through an adjustment.";
  return error.message;
}

export async function saveProductAction(_prev: { error?: string; ok?: boolean; message?: string; id?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
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
  const trackStock = formData.get("trackStock") === "on";
  const quantityRaw = String(formData.get("stockQuantity") ?? "").trim();
  const desiredQuantity = Number(quantityRaw === "" ? "0" : quantityRaw);
  if (!Number.isInteger(desiredQuantity) || desiredQuantity < 0) {
    return { error: "Enter a stock quantity of zero or more." };
  }
  const thresholdRaw = String(formData.get("lowStockThreshold") ?? "").trim();
  const lowStockThreshold = thresholdRaw === "" ? null : Number(thresholdRaw);
  if (lowStockThreshold != null && (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0)) {
    return { error: "Low-stock threshold must be a whole number, or left empty for the store default of 3." };
  }
  const variantParsed = variantInputSchema.safeParse({
    sku: formData.get("sku"),
    label: formData.get("label"),
    sizeMl: formData.get("sizeMl") || undefined,
    priceMinor,
    compareAtMinor: compareAtMinor ?? undefined,
    stock: desiredQuantity,
  });
  if (!variantParsed.success) return { error: variantParsed.error.issues[0]?.message ?? "Check the size, SKU, and stock." };
  const variantId = String(formData.get("variantId") || crypto.randomUUID());
  const { error: variantError } = await admin.from("product_variants").upsert({
    id: variantId,
    product_id: id,
    sku: variantParsed.data.sku,
    label: variantParsed.data.label,
    size_ml: variantParsed.data.sizeMl ?? null,
    price_minor: variantParsed.data.priceMinor,
    compare_at_minor: variantParsed.data.compareAtMinor ?? null,
    low_stock_threshold: lowStockThreshold,
  });
  if (variantError) return { error: variantError.message };
  const { data: currentStock } = await admin
    .from("product_variants")
    .select("stock_quantity, track_stock")
    .eq("id", variantId)
    .maybeSingle();
  const currentQuantity = Number(currentStock?.stock_quantity ?? 0);
  if (desiredQuantity !== currentQuantity) {
    const opening = trackStock && !currentStock?.track_stock;
    const { error: stockError } = await admin.rpc("adjust_stock", {
      p_variant_id: variantId,
      p_change: desiredQuantity - currentQuantity,
      p_reason: opening ? "opening_stock" : "correction",
      p_order_id: null,
      p_note: opening ? "Opening stock" : "Product edit",
      p_created_by: auth.user.id,
    });
    if (stockError) return { error: stockErrorMessage(stockError) };
  }
  const { error: trackError } = await admin.from("product_variants").update({ track_stock: trackStock }).eq("id", variantId);
  if (trackError) return { error: trackError.message };

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

  updateTag("storefront");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  revalidatePath("/");
  const photoMissing = !imageUrl;
  const message = photoMissing
    ? "Product saved. Add a photo before this bottle goes on the shop."
    : "Product saved.";
  if (creating) redirect(`/admin/products/${id}${photoMissing ? "?notice=photo" : ""}`);
  return { ok: true as const, message, id };
}

export async function updateFulfillmentAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const next = String(formData.get("status")) as FulfillmentStatus;
  if (!fulfillmentStatuses.includes(next)) return { error: "Invalid status." };
  const tracking = String(formData.get("trackingNumber") ?? "") || undefined;
  const returnToStock = formData.get("returnToStock") === "on";
  try {
    const before = await getOrderById(orderId);
    await updateFulfillment(orderId, next, tracking, { returnToStock, actorId: auth.user.id });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    updateTag("storefront");
    if (returnToStock && next === "cancelled") {
      return {
        ok: true as const,
        message: before?.stockApplied
          ? "Order cancelled. Bottles were returned to stock."
          : "Order cancelled. Stock was not held for this order, so nothing was returned.",
      };
    }
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
    updateTag("storefront");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    return { ok: true as const, message: "Marked paid. This records that you received payment on WhatsApp." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not mark paid." };
  }
}

export async function refundOrderAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const order = await getOrderById(orderId);
  if (!order?.paystackReference) return { error: "No Paystack reference on this order." };
  if (order.paymentStatus !== "paid") return { error: "Only paid orders can be refunded through Paystack." };
  const returnToStock = formData.get("returnToStock") === "on";
  try {
    await refundPaystackTransaction({ transactionReference: order.paystackReference });
    if (!returnToStock) {
      return { ok: true as const, message: "Refund requested with Paystack. Status updates via webhook." };
    }
    const returned = await returnStockForOrder(orderId, auth.user.id);
    updateTag("storefront");
    return {
      ok: true as const,
      message: returned
        ? "Refund requested. Bottles were returned to stock."
        : "Refund requested. Stock was not held for this order, so nothing was returned.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Refund failed." };
  }
}

export async function adjustStockAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const admin = needDb();
  const variantId = String(formData.get("variantId") ?? "");
  const amount = Number(formData.get("amount"));
  const direction = String(formData.get("direction") ?? "add");
  const reason = String(formData.get("reason") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!variantId) return { error: "Choose a size." };
  if (!Number.isInteger(amount) || amount < 1) return { error: "Enter a whole number of bottles." };
  if (!ADJUST_REASONS.includes(reason as (typeof ADJUST_REASONS)[number])) return { error: "Choose a reason." };
  const change = direction === "remove" ? -amount : amount;
  const { error } = await admin.rpc("adjust_stock", {
    p_variant_id: variantId,
    p_change: change,
    p_reason: reason,
    p_order_id: null,
    p_note: note,
    p_created_by: auth.user.id,
  });
  if (error) return { error: stockErrorMessage(error) };
  updateTag("storefront");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/stock/${variantId}`);
  return { ok: true as const, message: "Stock updated." };
}

export async function startTrackingAction(_prev: { error?: string; ok?: boolean; message?: string } | null, formData: FormData) {
  const auth = await requireAdmin();
  const admin = needDb();
  const only = String(formData.get("only") ?? "");
  const ids = (only ? [only] : formData.getAll("variantId").map(String)).filter(Boolean);
  if (!ids.length) return { error: "Choose a size." };
  let started = 0;
  for (const id of ids) {
    const raw = formData.get(`quantity-${id}`) ?? formData.get("quantity");
    const desired = Number(raw);
    if (!Number.isInteger(desired) || desired < 0) return { error: "Enter a quantity of zero or more for every size." };
    const { data: row, error: readError } = await admin
      .from("product_variants")
      .select("stock_quantity, track_stock")
      .eq("id", id)
      .maybeSingle();
    if (readError || !row) return { error: "That size was not found." };
    if (row.track_stock) continue;
    const current = Number(row.stock_quantity ?? 0);
    if (desired !== current) {
      const { error } = await admin.rpc("adjust_stock", {
        p_variant_id: id,
        p_change: desired - current,
        p_reason: "opening_stock",
        p_order_id: null,
        p_note: "Opening stock",
        p_created_by: auth.user.id,
      });
      if (error) return { error: stockErrorMessage(error) };
    }
    const { error: trackError } = await admin.from("product_variants").update({ track_stock: true }).eq("id", id);
    if (trackError) return { error: trackError.message };
    started += 1;
  }
  updateTag("storefront");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/opening");
  return {
    ok: true as const,
    message: started
      ? `Tracking started for ${started} ${started === 1 ? "size" : "sizes"}.`
      : "Those sizes are already tracked.",
  };
}
