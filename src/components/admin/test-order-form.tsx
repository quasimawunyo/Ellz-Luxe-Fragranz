"use client";

import { useRef, useState } from "react";
import { bulkSetOrderTestAction } from "@/app/actions/order-desk";
import { Button } from "@/components/ui/button";

export function TestOrderForm({
  orders,
  children,
}: {
  orders: { id: string; stockApplied: boolean }[];
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [notice, setNotice] = useState("");

  async function run(isTest: boolean, returnStock: boolean) {
    const form = formRef.current;
    if (!form || pending) return;
    const data = new FormData(form);
    const ids = new Set(data.getAll("orderId").map(String));
    if (!ids.size) {
      setNotice("Select an order first.");
      return;
    }
    if (isTest && !returnStock && orders.some((order) => ids.has(order.id) && order.stockApplied)) {
      setDialog(true);
      return;
    }
    setPending(true);
    setNotice("");
    data.set("isTest", isTest ? "true" : "false");
    data.set("returnStock", returnStock ? "true" : "false");
    const result = await bulkSetOrderTestAction(data);
    setPending(false);
    setDialog(false);
    if (result && "error" in result && result.error) setNotice(result.error);
  }

  return (
    <form ref={formRef} className="mt-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={pending} onClick={() => run(true, false)}>
          Mark selected as test
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => run(false, false)}>
          Not a test
        </Button>
      </div>
      {notice ? <p className="mt-3 text-sm text-taupe">{notice}</p> : null}
      {dialog ? (
        <div role="dialog" aria-modal="true" className="mt-3 max-w-lg space-y-3 rounded-2xl border border-espresso/15 bg-ivory p-4">
          <p className="text-sm">
            Mark the selected orders as tests. Money and coupon use stay as they are. Stock taken for these orders will be returned.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setDialog(false)}>
              Go back
            </Button>
            <Button type="button" disabled={pending} onClick={() => run(true, true)}>
              {pending ? "Working…" : "Return stock"}
            </Button>
          </div>
        </div>
      ) : null}
      {children}
    </form>
  );
}
