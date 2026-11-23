"use client";

import Link from "next/link";
import { useState } from "react";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";
import { StatusPill } from "@/components/admin/status-pill";
import { TestOrderForm } from "@/components/admin/test-order-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { orderMatchesQuery, type OrderListQuery } from "@/lib/orders/desk";
import { fulfillmentStatuses, paymentStatuses } from "@/lib/orders/transitions";

type DeskOrder = {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  deliveryMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  isTest: boolean;
  totalMinor: number;
  currencyCode: string;
  createdAt: string;
  stockApplied: boolean;
};

export function OrderDesk({
  listed,
  searchable,
  query,
  queue,
}: {
  listed: DeskOrder[];
  searchable: DeskOrder[];
  query: OrderListQuery;
  queue: boolean;
}) {
  const [text, setText] = useState(query.q ?? "");
  const orders = text.trim() ? searchable.filter((order) => orderMatchesQuery(order, text)) : listed;

  return (
    <>
      <form className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" method="get">
        {query.view ? <input type="hidden" name="view" value={query.view} /> : <input type="hidden" name="view" value="all" />}
        <Input
          name="q"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Order, name, or phone"
          autoComplete="off"
        />
        <select name="fulfilment" defaultValue={query.fulfilment ?? ""} className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All fulfilment</option>
          {fulfillmentStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={query.payment ?? ""} className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All payments</option>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select name="method" defaultValue={query.method ?? ""} className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">Pickup and delivery</option>
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
        <label className="text-sm text-taupe">
          From
          <Input name="from" type="date" defaultValue={query.from} />
        </label>
        <label className="text-sm text-taupe">
          To
          <Input name="to" type="date" defaultValue={query.to} />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input name="tests" value="1" type="checkbox" defaultChecked={query.tests === "1"} />
          Include test orders
        </label>
        <Button type="submit">Filter</Button>
      </form>
      <p className="mt-4 text-sm text-taupe" aria-live="polite">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>
      <TestOrderForm orders={orders.map((order) => ({ id: order.id, stockApplied: order.stockApplied }))}>
        <ul className="mt-6 space-y-3 lg:hidden">
          {orders.map((order) => (
            <li key={order.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-h-11 items-center gap-3">
                  <input type="checkbox" name="orderId" value={order.id} className="size-5" />
                  <Link href={`/admin/orders/${order.id}`} className="font-medium">
                    {order.orderNumber}
                  </Link>
                </label>
                <p className="pt-3 text-sm">{formatMoney(order.totalMinor, order.currencyCode)}</p>
              </div>
              <p className="text-sm">{order.fullName}</p>
              <p className="text-sm text-taupe">{order.deliveryMethod}</p>
              <CustomerWhatsApp className="mt-1" phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill value={order.paymentStatus} />
                <StatusPill value={order.fulfillmentStatus} />
                {order.isTest ? <StatusPill value="test" /> : null}
              </div>
            </li>
          ))}
        </ul>
        <div className="luxe-panel mt-8 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/10 text-xs text-taupe">
                <th className="px-4 py-3">Select</th>
                <th className="px-4 py-3">Order</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Payment</th>
                <th>Fulfilment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-espresso/10 last:border-0">
                  <td className="px-4 py-3">
                    <input type="checkbox" name="orderId" value={order.id} aria-label={`Select ${order.orderNumber}`} className="size-5" />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-taupe">
                      {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(new Date(order.createdAt))}
                    </p>
                  </td>
                  <td>
                    <p>{order.fullName}</p>
                    <CustomerWhatsApp phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
                  </td>
                  <td>{order.deliveryMethod}</td>
                  <td>
                    <StatusPill value={order.paymentStatus} />
                  </td>
                  <td>
                    <StatusPill value={order.fulfillmentStatus} />
                  </td>
                  <td>{formatMoney(order.totalMinor, order.currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length ? (
          <p className="mt-8 text-sm text-taupe">{queue && !text.trim() ? "No paid orders need action." : "No orders match this filter."}</p>
        ) : null}
      </TestOrderForm>
    </>
  );
}
