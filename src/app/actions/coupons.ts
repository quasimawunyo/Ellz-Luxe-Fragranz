"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { resolveCart } from "@/lib/cart/store";
import { getVariantById } from "@/lib/catalog/queries";
import { COUPON_COOKIE, couponDiscount, findCoupon, restoreCouponUse } from "@/lib/coupons";
import { recordStaffActivity } from "@/lib/admin/activity";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { minorFromCedisInput } from "@/lib/money";

export async function applyCouponAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`coupon:${ip}`, 10, 60_000).ok) return { error: "Please wait before trying another code." };
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "That code is not valid." };
  const coupon = await findCoupon(code);
  if (!coupon) return { error: "That code is not valid." };
  if ("missing" in coupon) return { error: "Coupons are not ready yet." };
  const cart = await resolveCart();
  const lines = [];
  for (const line of cart.lines) {
    const match = await getVariantById(line.variantId);
    lines.push({ lineMinor: line.lineMinor, onSale: Boolean(match && match.variant.compareAtMinor && match.variant.compareAtMinor > match.variant.priceMinor) });
  }
  const result = couponDiscount(coupon, lines);
  if ("error" in result) return { error: result.error };
  const store = await cookies();
  store.set(COUPON_COOKIE, coupon.code, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  revalidatePath("/checkout");
  return { ok: true as const };
}

export async function clearCouponAction() {
  const store = await cookies();
  store.delete(COUPON_COOKIE);
  revalidatePath("/checkout");
}

export async function saveCouponAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const auth = await requireAdmin();
  const admin = createServiceClient();
  if (!admin) return { error: "Database is not ready." };
  const code = String(formData.get("code") ?? "").trim();
  const type = String(formData.get("discountType") ?? "");
  if (!code || code.length > 40) return { error: "Enter a coupon code." };
  if (type !== "percent" && type !== "fixed") return { error: "Choose percent or a fixed amount." };
  let valueMinor = 0;
  if (type === "percent") {
    valueMinor = Number(formData.get("percent"));
    if (!Number.isInteger(valueMinor) || valueMinor < 1 || valueMinor > 90) return { error: "Enter a percent from 1 to 90." };
  } else {
    const money = minorFromCedisInput(formData.get("cedis"));
    if (money == null || money <= 0) return { error: "Enter a fixed amount above GH₵0." };
    valueMinor = money;
  }
  const minimumText = String(formData.get("minimum") ?? "").trim();
  const minimum = minimumText ? minorFromCedisInput(minimumText) : null;
  if (minimumText && minimum == null) return { error: "Enter the minimum order in Ghana cedis, or leave it empty." };
  const maxText = String(formData.get("maxUses") ?? "").trim();
  const maxUses = maxText === "" ? null : Number(maxText);
  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) return { error: "Enter a use limit of 1 or more, or leave it empty." };
  const starts = String(formData.get("startsAt") ?? "").trim() || null;
  const expires = String(formData.get("expiresAt") ?? "").trim() || null;
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    code,
    discount_type: type as "percent" | "fixed",
    value_minor: valueMinor,
    starts_at: starts,
    expires_at: expires,
    max_uses: maxUses,
    minimum_order_minor: minimum,
    active: formData.get("active") === "on",
  };
  const query = id ? admin.from("coupons").update(payload).eq("id", id) : admin.from("coupons").insert(payload);
  const { error } = await query;
  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") return { error: "That code already exists." };
    return { error: "The coupon could not be saved." };
  }
  await recordStaffActivity({
    actorId: auth.user.id,
    actorEmail: auth.email,
    action: "coupon",
    targetId: id || code,
    after: `${code} ${type} ${payload.active ? "active" : "paused"}`,
  });
  revalidatePath("/admin/coupons");
  return { ok: true as const };
}

export async function pauseCouponAction(formData: FormData) {
  const auth = await requireAdmin();
  const admin = createServiceClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await admin.from("coupons").update({ active }).eq("id", id);
  await recordStaffActivity({
    actorId: auth.user.id,
    actorEmail: auth.email,
    action: "coupon",
    targetId: id,
    after: active ? "resumed" : "paused",
  });
  revalidatePath("/admin/coupons");
}

export async function restoreCouponUseAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const result = await restoreCouponUse(orderId);
  if ("error" in result && result.error) return;
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function deleteCouponAction(formData: FormData) {
  const auth = await requireAdmin();
  const admin = createServiceClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const { data } = await admin.from("coupons").select("uses_count, code").eq("id", id).maybeSingle();
  if (!data) return;
  if (data.uses_count > 0) {
    await admin.from("coupons").update({ active: false }).eq("id", id);
  } else {
    await admin.from("coupons").delete().eq("id", id);
  }
  await recordStaffActivity({
    actorId: auth.user.id,
    actorEmail: auth.email,
    action: "coupon",
    targetId: id,
    after: data.uses_count > 0 ? `${data.code} paused` : `${data.code} deleted`,
  });
  revalidatePath("/admin/coupons");
}
