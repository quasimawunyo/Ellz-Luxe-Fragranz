import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/money";

export const COUPON_COOKIE = "elf_coupon";

export type CouponRow = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  value_minor: number;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  minimum_order_minor: number | null;
  active: boolean;
};

export type CouponLine = {
  lineMinor: number;
  onSale: boolean;
};

export async function readCouponCode() {
  const store = await cookies();
  return store.get(COUPON_COOKIE)?.value?.trim() ?? "";
}

export async function findCoupon(code: string): Promise<CouponRow | { missing: true } | null> {
  const admin = createServiceClient();
  if (!admin) return { missing: true };
  const { data, error } = await admin.from("coupons").select("*").ilike("code", code.trim()).maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.message.toLowerCase().includes("coupons")) return { missing: true };
    return null;
  }
  return data as CouponRow | null;
}

export async function countCouponUse(orderId: string) {
  const admin = createServiceClient();
  if (!admin) return;
  const { error } = await admin.rpc("redeem_coupon", { p_order_id: orderId });
  if (error && error.code !== "42883" && !error.message.toLowerCase().includes("redeem_coupon") && !error.message.toLowerCase().includes("coupon_redemptions")) {
    return;
  }
}

export async function restoreCouponUse(orderId: string) {
  const admin = createServiceClient();
  if (!admin) return { error: "Database is not ready." };
  const { data: redemption } = await admin.from("coupon_redemptions").select("id, coupon_id").eq("order_id", orderId).maybeSingle();
  if (!redemption) return { error: "This order has no coupon use to restore." };
  const { data: coupon } = await admin.from("coupons").select("uses_count").eq("id", redemption.coupon_id).maybeSingle();
  if (coupon && coupon.uses_count > 0) {
    await admin.from("coupons").update({ uses_count: coupon.uses_count - 1 }).eq("id", redemption.coupon_id).eq("uses_count", coupon.uses_count);
  }
  await admin.from("coupon_redemptions").delete().eq("id", redemption.id);
  return { ok: true as const };
}

export function couponDiscount(
  coupon: CouponRow,
  lines: CouponLine[],
  now = Date.now(),
): { error: string } | { discountMinor: number; code: string } {
  if (!coupon.active) return { error: "That code is not valid." };
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return { error: "That code is not valid." };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= now) return { error: "That code has expired." };
  if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) return { error: "That code has been used up." };
  const goods = lines.reduce((sum, line) => sum + line.lineMinor, 0);
  if (coupon.minimum_order_minor != null && goods < coupon.minimum_order_minor) {
    return { error: `Spend ${formatMoney(coupon.minimum_order_minor)} or more to use this code.` };
  }
  const eligible = lines.filter((line) => !line.onSale).reduce((sum, line) => sum + line.lineMinor, 0);
  if (eligible <= 0) return { error: "This code does not apply to bottles already on sale." };
  const discount =
    coupon.discount_type === "percent"
      ? Math.floor((eligible * coupon.value_minor) / 100)
      : coupon.value_minor;
  if (discount <= 0 || discount >= eligible) return { error: "That code is not valid." };
  return { discountMinor: discount, code: coupon.code };
}
