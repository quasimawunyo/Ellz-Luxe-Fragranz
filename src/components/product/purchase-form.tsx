"use client";

import { useActionState, useState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import type { ProductVariant } from "@/lib/catalog/types";

export function PurchaseForm({
  variants,
  currencyCode = "GHS",
}: {
  variants: ProductVariant[];
  currencyCode?: string;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [state, formAction] = useActionState(addToCartAction, null);
  const selected = variants.find((variant) => variant.id === variantId) ?? variants[0];
  const max = Math.min(6, selected?.stock || 1);
  const soldOut = !selected || selected.stock < 1;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {selected ? (
        <Price
          className="text-xl"
          amountMinor={selected.priceMinor}
          compareAtMinor={selected.compareAtMinor}
          currencyCode={currencyCode}
        />
      ) : null}
      <fieldset>
        <legend className="mb-2 text-xs uppercase tracking-[0.16em] text-taupe">Size</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const selectedSize = variant.id === variantId;
            return (
              <label
                key={variant.id}
                className={`cursor-pointer border px-4 py-2 text-sm ${
                  selectedSize
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-espresso/20"
                }`}
              >
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  checked={selectedSize}
                  onChange={() => setVariantId(variant.id)}
                  className="sr-only"
                />
                {variant.label}
                {variant.stock < 1 ? " (sold out)" : ""}
              </label>
            );
          })}
        </div>
      </fieldset>
      <QuantitySelector key={variantId} max={max} />
      <Button type="submit" disabled={soldOut}>
        Add to cart
      </Button>
      {state?.error ? (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
