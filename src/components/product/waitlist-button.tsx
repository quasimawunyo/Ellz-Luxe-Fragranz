"use client";

import { useActionState, useEffect, useState } from "react";
import { joinWaitlistAction } from "@/app/actions/waitlist";
import { useSavedLists } from "@/lib/saved/use-saved-lists";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WaitlistButton({ productId, wide }: { productId: string; wide?: boolean }) {
  const { isWaiting, addWaiting } = useSavedLists();
  const waiting = isWaiting(productId);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(joinWaitlistAction, null);

  useEffect(() => {
    if (state?.ok) addWaiting(productId);
  }, [state, addWaiting, productId]);

  if (waiting || state?.ok) {
    return <p className="text-sm text-leaf">Waiting for restock</p>;
  }

  if (!open) {
    return (
      <button type="button" className={cn(buttonVariants({ variant: "shop", size: "sm" }), wide && "w-full")} onClick={() => setOpen(true)}>
        Notify me
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <label className="sr-only" htmlFor={`wait-${productId}`}>
        Email for restock notice
      </label>
      <input
        id={`wait-${productId}`}
        name="email"
        type="email"
        required
        placeholder="Email for restock notice"
        className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
      />
      <button type="submit" className={cn(buttonVariants({ variant: "shop", size: "sm" }))}>
        Join waitlist
      </button>
      {state?.error ? (
        <p role="alert" className="text-xs text-red-800">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
