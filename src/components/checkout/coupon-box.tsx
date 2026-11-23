"use client";

import { useActionState } from "react";
import { applyCouponAction, clearCouponAction } from "@/app/actions/coupons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Price } from "@/components/ui/price";

export function CouponBox({
  code,
  discountMinor,
  currencyCode,
  error,
}: {
  code: string | null;
  discountMinor: number;
  currencyCode: string;
  error: string | null;
}) {
  const [state, action, pending] = useActionState(applyCouponAction, null);
  const message = state?.error ?? error;

  if (code && discountMinor > 0) {
    return (
      <div className="mb-4 text-sm">
        <p className="flex justify-between gap-3">
          <span>Coupon {code}</span>
          <span>
            -<Price amountMinor={discountMinor} currencyCode={currencyCode} />
          </span>
        </p>
        <form action={clearCouponAction} className="mt-2">
          <button type="submit" className="min-h-11 text-sm underline">
            Remove
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="mb-4 space-y-2">
      <Label htmlFor="coupon">Coupon code</Label>
      <div className="flex gap-2">
        <Input id="coupon" name="code" autoComplete="off" className="min-h-11" />
        <Button type="submit" variant="outline" className="min-h-11" disabled={pending}>
          Apply
        </Button>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-red-800">
          {message}
        </p>
      ) : null}
    </form>
  );
}
