"use server";

import { revalidatePath } from "next/cache";
import { addItemToCart, updateCartQuantity } from "@/lib/cart/store";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validations";

export async function addToCartAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid cart request." };
  }
  try {
    await addItemToCart(parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add to cart." };
  }
}

export async function updateCartAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const parsed = updateCartItemSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid quantity." };
  }
  try {
    await updateCartQuantity(parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update cart." };
  }
}
