"use client";

import { useActionState, useEffect, useState } from "react";
import { joinWaitlistAction } from "@/app/actions/waitlist";
import { useSavedLists } from "@/lib/saved/use-saved-lists";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WaitlistButton({
  productId,
  overlay = false,
}: {
  productId: string;
  overlay?: boolean;
}) {
  const { isWaiting, addWaiting } = useSavedLists();
  const waiting = isWaiting(productId);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(joinWaitlistAction, null);

  useEffect(() => {
    if (state?.ok) addWaiting(productId);
  }, [state, addWaiting, productId]);

  const pill = overlay
    ? "w-[calc(100%-1.5rem)] rounded-full bg-leaf text-white hover:bg-leaf/90"
    : cn(buttonVariants({ variant: "shop", size: "sm" }));

  if (waiting || state?.ok) {
    return (
      <p className={cn("text-center text-sm font-medium text-leaf", overlay && "rounded-full bg-white/95 px-4 py-2.5")}>
        Waiting for restock
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={cn(pill, overlay && "min-h-11 px-4 text-sm font-medium")} onClick={() => setOpen(true)}>
        Notify me
      </button>
    );
  }

  return (
    <form action={formAction} className={cn("space-y-2", overlay && "w-[calc(100%-1.5rem)]")}>
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
        className="min-h-11 w-full rounded-full border border-espresso/15 bg-white px-4 text-sm"
      />
      <button type="submit" className={cn(buttonVariants({ variant: "shop", size: "sm" }), "w-full")}>
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
