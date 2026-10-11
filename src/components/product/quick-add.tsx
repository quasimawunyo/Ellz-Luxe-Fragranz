"use client";

import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickAdd({
  variantId,
  disabled,
  overlay = false,
}: {
  variantId: string;
  disabled?: boolean;
  overlay?: boolean;
}) {
  const [state, formAction] = useActionState(addToCartAction, null);

  return (
    <form action={formAction} className={overlay ? "w-[calc(100%-1.5rem)]" : undefined}>
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <button
        type="submit"
        disabled={disabled}
        className={
          overlay
            ? "min-h-11 w-full rounded-full bg-leaf px-4 text-sm font-medium text-white hover:bg-leaf/90 disabled:opacity-50"
            : cn(buttonVariants({ variant: "shop", size: "sm" }))
        }
      >
        Add to cart
      </button>
      {state?.error ? (
        <p role="alert" className="mt-2 text-xs text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
