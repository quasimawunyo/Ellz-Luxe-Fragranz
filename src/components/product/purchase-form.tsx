"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Price } from "@/components/ui/price";
import { LikeButton } from "@/components/product/like-button";
import { WaitlistButton } from "@/components/product/waitlist-button";
import type { ProductVariant } from "@/lib/catalog/types";
import { bottleSizeLabel } from "@/lib/catalog/helpers";
import { formatMoney } from "@/lib/money";
import { isSoldOut, maxPurchasable, storefrontStockLabel } from "@/lib/stock";

export function PurchaseForm({
  variants,
  selectedId,
  productId,
  productSlug,
  productName,
  currencyCode = "GHS",
}: {
  variants: ProductVariant[];
  selectedId: string;
  productId: string;
  productSlug: string;
  productName: string;
  currencyCode?: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(addToCartAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentId, setCurrentId] = useState(selectedId);
  const selected = variants.find((variant) => variant.id === currentId) ?? variants[0];
  const soldOut = !selected || isSoldOut(selected);
  const max = selected ? maxPurchasable(selected) : 1;
  const quantityError = state?.fields?.quantity;
  const size = bottleSizeLabel(selected);
  const several = variants.length > 1;

  useEffect(() => {
    if (!quantityError) return;
    formRef.current?.querySelector<HTMLElement>('[name="quantity"]')?.focus();
  }, [quantityError]);

  function choose(variant: ProductVariant) {
    setCurrentId(variant.id);
    const next = variant.sizeMl ? `/product/${productSlug}?size=${variant.sizeMl}` : `/product/${productSlug}`;
    router.replace(next, { scroll: false });
  }

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-5">
      {several ? (
        <fieldset>
          <legend className="text-sm font-medium">Size</legend>
          <div className="mt-2 grid gap-2">
            {variants.map((variant) => {
              const label = bottleSizeLabel(variant);
              const checked = variant.id === selected?.id;
              return (
                <label key={variant.id} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border border-espresso/15 px-3">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="sizeChoice"
                      value={variant.sizeMl ?? variant.id}
                      checked={checked}
                      onChange={() => choose(variant)}
                    />
                    <span>{label}</span>
                  </span>
                  <Price amountMinor={variant.priceMinor} compareAtMinor={variant.compareAtMinor} currencyCode={currencyCode} />
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {selected ? `${size || productName}, now ${formatMoney(selected.priceMinor, currencyCode)}` : ""}
      </p>
      {selected ? (
        <Price
          className="text-3xl font-semibold tracking-tight text-leaf sm:text-4xl"
          amountMinor={selected.priceMinor}
          compareAtMinor={selected.compareAtMinor}
          currencyCode={currencyCode}
          showSave
        />
      ) : null}
      {selected ? <input type="hidden" name="variantId" value={selected.id} /> : null}
      {selected ? (
        <p className={soldOut ? "text-sm text-red-800" : "text-sm text-leaf"}>{storefrontStockLabel(selected)}</p>
      ) : null}
      {selected ? <QuantitySelector max={soldOut ? 1 : max} disabled={soldOut} /> : null}
      {quantityError ? (
        <p id="quantity-error" role="alert" tabIndex={-1} className="text-sm text-red-800">
          {quantityError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {soldOut ? <WaitlistButton productId={productId} /> : <AddToCartButton className="w-full sm:w-auto" />}
        <LikeButton productId={productId} name={productName} />
      </div>
      {soldOut ? <p className="text-sm text-taupe">Out of stock. Join the restock list to be notified.</p> : null}
      {state?.ok ? (
        <p role="status" className="text-sm text-leaf">
          Added to cart. <Link href="/cart" className="underline">View cart</Link>
        </p>
      ) : null}
      {state?.error && !quantityError ? (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
