"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { productInputSchema } from "@/lib/validations";
import { parseSizeRows } from "@/lib/catalog/save-sizes";
import { minorFromCedisInput } from "@/lib/money";
import { isR2Configured, uploadProductPhoto } from "@/lib/storage/r2";
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

  const parsedSizes = parseSizeRows(String(formData.get("sizesJson") ?? ""), parsed.data.name, formData.get("confirmLowPrice") === "yes");
  if ("error" in parsedSizes) return { error: parsedSizes.error };
  const { data: existingVariants } = await admin.from("product_variants").select("id").eq("product_id", id);
  const existingIds = (existingVariants ?? []).map((row) => row.id);
  const kept = new Set(parsedSizes.sizes.map((size) => size.id).filter(Boolean));
  const removed = existingIds.filter((variantId) => !kept.has(variantId));
  if (removed.length) {
    const { data: ordered } = await admin.from("order_items").select("variant_id").in("variant_id", removed);
    if (ordered?.length) return { error: "This size has been ordered. Hide it instead of removing it." };
    const { error: deleteError } = await admin.from("product_variants").delete().in("id", removed);
    if (deleteError) return { error: deleteError.message };
  }
  for (const size of parsedSizes.sizes) {
    const variantId = size.id || crypto.randomUUID();
    const { data: skuOwner } = await admin.from("product_variants").select("id").eq("sku", size.sku).maybeSingle();
    if (skuOwner && skuOwner.id !== variantId) return { error: "This SKU is already used." };
    const { data: currentStock } = await admin.from("product_variants").select("stock, stock_quantity, track_stock").eq("id", variantId).maybeSingle();
    const { error: variantError } = await admin.from("product_variants").upsert({
      id: variantId,
      product_id: id,
      sku: size.sku,
      label: size.label,
      size_ml: size.sizeMl,
      price_minor: size.priceMinor,
      compare_at_minor: size.compareAtMinor,
      cost_price_minor: size.costMinor,
      low_stock_threshold: size.lowStockThreshold,
      visible: size.visible,
      stock: Number(currentStock?.stock ?? 0),
    });
    if (variantError) return { error: variantError.message };
    const currentQuantity = Number(currentStock?.stock_quantity ?? 0);
    if (size.stockQuantity !== currentQuantity) {
      const opening = size.trackStock && !currentStock?.track_stock;
      const { error: stockError } = await admin.rpc("adjust_stock", {
        p_variant_id: variantId,
        p_change: size.stockQuantity - currentQuantity,
        p_reason: opening ? "opening_stock" : "correction",
        p_order_id: null,
        p_note: opening ? "Opening stock" : "Product edit",
        p_created_by: auth.user.id,
      });
      if (stockError) return { error: stockErrorMessage(stockError) };
    }
    const { error: trackError } = await admin.from("product_variants").update({ track_stock: size.trackStock }).eq("id", variantId);
    if (trackError) return { error: trackError.message };
  }

  let imageUrl = parsed.data.imageUrl;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) return { error: "Product photos must be 2 MB or smaller." };
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return { error: "Use a JPEG, PNG, or WebP photo." };
    if (isR2Configured()) {
      try {
        imageUrl = await uploadProductPhoto({
          productId: id,
          body: new Uint8Array(await file.arrayBuffer()),
          contentType: file.type,
        });
      } catch (error) {
        return { error: error instanceof Error ? error.message : "The photo could not be saved." };
      }
    } else {
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${id}/${crypto.randomUUID()}.${extension}`;
      const upload = await admin.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (upload.error) return { error: upload.error.message };
      imageUrl = admin.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
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

export async function setSalePricesAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  await requireAdmin();
  const admin = needDb();
  const ids = formData.getAll("variantId").map(String);
  for (const id of ids) {
    const clear = formData.get(`clear:${id}`) === "on";
    const text = String(formData.get(`compare:${id}`) ?? "").trim();
    const { data: variant } = await admin.from("product_variants").select("price_minor").eq("id", id).maybeSingle();
    if (!variant) return { error: "That size is no longer on the shop." };
    if (clear || !text) {
      const { error } = await admin.from("product_variants").update({ compare_at_minor: null }).eq("id", id);
      if (error) return { error: "The sale price could not be saved." };
      continue;
    }
    const compareAt = minorFromCedisInput(text);
    if (compareAt == null) return { error: "Enter the compare-at price in Ghana cedis, or leave it empty." };
    if (compareAt <= variant.price_minor) return { error: "The compare-at price must be higher than the price." };
    const { error } = await admin.from("product_variants").update({ compare_at_minor: compareAt }).eq("id", id);
    if (error) return { error: "The sale price could not be saved." };
  }
  updateTag("storefront");
  revalidatePath("/admin/discounts");
  revalidatePath("/sale");
  return { ok: true as const };
}
