"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

export function QuickAdd({
  variantId,
  disabled,
  wide,
  label = "Add to cart",
}: {
  variantId: string;
  disabled?: boolean;
  wide?: boolean;
  label?: string;
}) {
  const [state, formAction] = useActionState(addToCartAction, null);

  return (
    <form action={formAction} className={wide ? "w-full" : undefined}>
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <AddToCartButton label={label} disabled={disabled} className={wide ? "w-full rounded-full" : undefined} />
      {state?.ok ? (
        <p role="status" className="mt-2 text-xs text-leaf">
          Added to cart. <Link href="/cart" className="underline">View cart</Link>
        </p>
      ) : null}
      {state?.error ? (
        <p role="alert" className="mt-2 text-xs text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
