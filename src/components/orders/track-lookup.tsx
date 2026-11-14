"use client";

import { useActionState, useState } from "react";
import { trackOrderAction, type TrackLookupState } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function TrackLookup() {
  const [state, action, pending] = useActionState(trackOrderAction, null as TrackLookupState);
  const [query, setQuery] = useState("");

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="query">Phone or order number</Label>
        <Input
          id="query"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="020… or ELF-…"
          required
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="shop" disabled={pending} className="rounded-xl px-5">
        {pending ? "Looking…" : "See my order"}
      </Button>
      {state?.error ? (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state?.orders?.length ? (
        <ul className="space-y-4 pt-2">
          {state.orders.map((order) => (
            <li key={order.orderNumber} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
              <p className="font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-taupe">{order.placed}</p>
              <p className="mt-4 text-lg font-medium">{order.fulfilment}</p>
              <p className="mt-1 text-sm text-taupe">{order.payment}</p>
              <p className="mt-1 text-sm">{order.deliveryMethod}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={`${item.name}-${item.size}`}>
                    {item.name} · {item.size} × {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
