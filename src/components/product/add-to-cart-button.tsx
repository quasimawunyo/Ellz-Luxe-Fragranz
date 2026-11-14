"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  label = "Add to cart",
  className,
  disabled,
}: {
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="shop" className={cn(className)} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
          Adding…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
