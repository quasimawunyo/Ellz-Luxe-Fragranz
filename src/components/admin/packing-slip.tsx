"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { StoreOrder } from "@/lib/orders/types";

export function PackingSlip({ order }: { order: StoreOrder }) {
  const [hidePrices, setHidePrices] = useState(false);

  return (
    <article className="mx-auto max-w-2xl bg-white p-6 text-espresso">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hidePrices} onChange={(event) => setHidePrices(event.target.checked)} />
          Hide prices
        </label>
        <Button type="button" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <header className="mt-6 border-b border-espresso/15 pb-4">
        <p className="text-sm text-taupe">EllzLuxe Fragranz</p>
        <h1 className="mt-1 font-serif text-4xl">{order.orderNumber}</h1>
        <p className="mt-2 text-sm">{order.deliveryMethod}</p>
      </header>
      <section className="mt-6 text-sm leading-6">
        <p className="font-medium">{order.fullName}</p>
        <p>{order.phone}</p>
        <p>{order.email}</p>
        <p className="mt-2">
          {order.addressLine}
          <br />
          {order.locality}, {order.region}
        </p>
        {order.notes ? <p className="mt-3">Notes: {order.notes}</p> : null}
      </section>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-espresso/15 text-xs text-taupe">
            <th className="py-2">Item</th>
            <th>Size</th>
            <th>Qty</th>
            {hidePrices ? null : <th className="text-right">Price</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={`${item.sku}-${item.variantLabel}`} className="border-b border-espresso/10">
              <td className="py-2">{item.productName}</td>
              <td>{item.variantLabel}</td>
              <td>{item.quantity}</td>
              {hidePrices ? null : (
                <td className="text-right">{formatMoney(item.unitPriceMinor * item.quantity, order.currencyCode)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
