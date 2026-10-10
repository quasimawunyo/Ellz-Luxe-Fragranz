"use client";

import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickAdd({ variantId, disabled }: { variantId: string; disabled?: boolean }) {
  const [state, formAction] = useActionState(addToCartAction, null);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <button
        type="submit"
        disabled={disabled}
        className={cn(buttonVariants({ variant: "primary", size: "sm" }), "w-full")}
      >
        {disabled ? "Sold out" : "Add to cart"}
      </button>
      {state?.error ? (
        <p role="alert" className="mt-2 text-xs text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
