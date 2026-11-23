"use server";

import { headers } from "next/headers";
import { validationState, type FormState } from "@/lib/forms/errors";
import { waitlistSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProductById } from "@/lib/catalog/queries";
import { productHasSellableVariant } from "@/lib/stock";

export async function joinWaitlistAction(_prev: FormState | null, formData: FormData): Promise<FormState> {
  const parsed = waitlistSchema.safeParse({
    productId: formData.get("productId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const product = await getProductById(parsed.data.productId);
  if (!product || product.status !== "published") {
    return { error: "That bottle is not on the shop." };
  }
  if (productHasSellableVariant(product)) {
    return { error: "This bottle is in stock. Add it to your cart instead." };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? "anon";
  if (!rateLimit(`wait:${ip}:${parsed.data.productId}`, 8, 60_000).ok) {
    return { error: "Please wait before submitting again." };
  }

  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    const { error } = await admin!.from("restock_waitlist").insert({
      product_id: parsed.data.productId,
      email: parsed.data.email.toLowerCase(),
    });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { error: "Could not save your waitlist request." };
    }
  }

  return { ok: true as const, message: "You are on the restock list for this bottle." };
}
