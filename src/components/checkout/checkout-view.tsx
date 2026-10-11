"use client";

import { useMemo, useState } from "react";
import { placeOrderAction } from "@/app/actions/checkout";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { GHANA_REGIONS } from "@/lib/ghana";
import { orderGrandTotal } from "@/lib/money";
import type { DeliveryMethod } from "@/lib/catalog/types";

type CheckoutLine = {
  variantId: string;
  productName: string;
  label: string;
  quantity: number;
  lineMinor: number;
};

export function CheckoutView({
  fullName,
  email,
  lines,
  subtotalMinor,
  currencyCode,
  deliveryMethods,
  payLabel,
}: {
  fullName: string;
  email: string;
  lines: CheckoutLine[];
  subtotalMinor: number;
  currencyCode: string;
  deliveryMethods: DeliveryMethod[];
  payLabel: string;
}) {
  const [region, setRegion] = useState<(typeof GHANA_REGIONS)[number]>("Greater Accra");
  const [deliveryMethodId, setDeliveryMethodId] = useState(deliveryMethods[0]?.id ?? "accra");
  const shipping = useMemo(
    () => deliveryMethods.find((method) => method.id === deliveryMethodId)?.amountMinor ?? 0,
    [deliveryMethodId, deliveryMethods],
  );
  const totalMinor = orderGrandTotal(subtotalMinor, shipping);

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
      <ActionForm action={placeOrderAction} className="space-y-5">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required defaultValue={fullName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="024 000 0000" />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <select
            id="region"
            name="region"
            required
            value={region}
            onChange={(event) => {
              const next = event.target.value as (typeof GHANA_REGIONS)[number];
              setRegion(next);
              if (deliveryMethodId === "accra" || deliveryMethodId === "national") {
                setDeliveryMethodId(next === "Greater Accra" ? "accra" : "national");
              }
            }}
            className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
          >
            {GHANA_REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="locality">Locality / city</Label>
          <Input id="locality" name="locality" required placeholder="East Legon" />
        </div>
        <div>
          <Label htmlFor="addressLine">Street address</Label>
          <Input id="addressLine" name="addressLine" required />
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs uppercase tracking-[0.16em] text-taupe">Delivery</legend>
          {deliveryMethods.map((method) => (
            <label key={method.id} className="flex cursor-pointer items-start gap-3 border border-espresso/10 p-3">
              <input
                type="radio"
                name="deliveryMethodId"
                value={method.id}
                required
                checked={deliveryMethodId === method.id}
                onChange={() => setDeliveryMethodId(method.id)}
              />
              <span>
                <span className="block font-medium">{method.label}</span>
                <span className="text-sm text-taupe">{method.description}</span>
                <span className="mt-1 block text-sm">
                  <Price amountMinor={method.amountMinor} currencyCode={currencyCode} />
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        <div>
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea id="notes" name="notes" />
        </div>
        <Button type="submit">{payLabel}</Button>
      </ActionForm>
      <aside className="h-fit border border-espresso/10 bg-white p-6">
        <h2 className="font-serif text-2xl">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-3">
              <span>
                {line.productName} · {line.label} × {line.quantity}
              </span>
              <Price amountMinor={line.lineMinor} currencyCode={currencyCode} />
            </li>
          ))}
        </ul>
        <p className="mt-6 flex justify-between border-t border-espresso/10 pt-4 text-sm">
          <span>Subtotal</span>
          <Price amountMinor={subtotalMinor} currencyCode={currencyCode} />
        </p>
        <p className="mt-2 flex justify-between text-sm">
          <span>Delivery</span>
          <Price amountMinor={shipping} currencyCode={currencyCode} />
        </p>
        <p className="mt-4 flex justify-between border-t border-espresso/10 pt-4 font-medium">
          <span>Total</span>
          <Price amountMinor={totalMinor} currencyCode={currencyCode} />
        </p>
      </aside>
    </div>
  );
}
