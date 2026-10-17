"use client";

import { useState } from "react";
import { placeOrderAction } from "@/app/actions/checkout";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { GHANA_REGIONS } from "@/lib/ghana";
import { deliveryIsQuoted, publicVariantLabel } from "@/lib/catalog/helpers";
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
  const selectedMethod = deliveryMethods.find((method) => method.id === deliveryMethodId);
  const shipping = selectedMethod?.amountMinor ?? 0;
  const quoted = selectedMethod ? deliveryIsQuoted(selectedMethod) : false;
  const totalMinor = orderGrandTotal(subtotalMinor, shipping);

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
      <ActionForm action={placeOrderAction} className="space-y-5">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required autoComplete="name" defaultValue={fullName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="024 000 0000" />
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
            autoComplete="address-level1"
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
          <Input id="locality" name="locality" required autoComplete="address-level2" placeholder="East Legon" />
        </div>
        <div>
          <Label htmlFor="addressLine">Street address</Label>
          <Input id="addressLine" name="addressLine" required autoComplete="street-address" />
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">Delivery</legend>
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
                  {deliveryIsQuoted(method) ? (
                    "Quoted for your location"
                  ) : method.id === "pickup" ? (
                    "Free"
                  ) : (
                    <Price amountMinor={method.amountMinor} currencyCode={currencyCode} />
                  )}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        <div>
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea id="notes" name="notes" />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          {payLabel}
        </Button>
      </ActionForm>
      <aside className="luxe-panel h-fit p-6">
        <h2 className="text-lg font-semibold">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-3">
              <span>
                {line.productName}
                {publicVariantLabel(line.label) ? ` · ${publicVariantLabel(line.label)}` : ""} × {line.quantity}
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
          <span>
            {quoted ? "Quoted for your location" : deliveryMethodId === "pickup" ? "Free" : <Price amountMinor={shipping} currencyCode={currencyCode} />}
          </span>
        </p>
        <p className="mt-4 flex justify-between border-t border-espresso/10 pt-4 text-xl font-semibold text-leaf">
          <span className="text-espresso">{quoted ? "Goods total" : "Total"}</span>
          <Price amountMinor={totalMinor} currencyCode={currencyCode} />
        </p>
      </aside>
    </div>
  );
}
