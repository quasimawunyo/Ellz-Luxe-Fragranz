"use server";

import { revalidatePath } from "next/cache";
import { addItemToCart, updateCartQuantity } from "@/lib/cart/store";
import { validationState, type FormState } from "@/lib/forms/errors";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validations";

export async function addToCartAction(_prev: FormState | null, formData: FormData): Promise<FormState> {
  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return validationState(parsed.error);
  try {
    await addItemToCart(parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add to cart." };
  }
}

export async function updateCartAction(_prev: FormState | null, formData: FormData): Promise<FormState> {
  const parsed = updateCartItemSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return validationState(parsed.error);
  try {
    await updateCartQuantity(parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update cart." };
  }
}
