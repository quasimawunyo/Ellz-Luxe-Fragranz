"use client";

import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { LikeButton } from "@/components/product/like-button";
import { WaitlistButton } from "@/components/product/waitlist-button";
import type { ProductVariant } from "@/lib/catalog/types";

export function PurchaseForm({
  variants,
  productId,
  productName,
  currencyCode = "GHS",
}: {
  variants: ProductVariant[];
  productId: string;
  productName: string;
  currencyCode?: string;
}) {
  const [state, formAction] = useActionState(addToCartAction, null);
  const selected = variants[0];
  const max = Math.min(6, selected?.stock || 1);
  const soldOut = !selected || selected.stock < 1;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {selected ? (
        <Price
          className="text-3xl font-semibold tracking-tight text-leaf sm:text-4xl"
          amountMinor={selected.priceMinor}
          compareAtMinor={selected.compareAtMinor}
          currencyCode={currencyCode}
        />
      ) : null}
      {selected ? <input type="hidden" name="variantId" value={selected.id} /> : null}
      {soldOut ? null : <QuantitySelector max={max} />}
      <div className="flex flex-wrap items-center gap-3">
        {soldOut ? (
          <WaitlistButton productId={productId} />
        ) : (
          <Button type="submit" variant="shop" className="w-full sm:w-auto">
            Add to cart
          </Button>
        )}
        <LikeButton productId={productId} name={productName} />
      </div>
      {soldOut ? <p className="text-sm text-taupe">Out of stock. Join the restock list to be notified.</p> : null}
      {state?.error ? (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
