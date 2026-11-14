import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { filterOrders, isDefaultOrderQueue, type OrderListQuery } from "@/lib/orders/desk";
import { fulfillmentStatuses, paymentStatuses } from "@/lib/orders/transitions";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/admin/status-pill";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";

export const metadata = { title: "Orders · Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderListQuery>;
}) {
  const query = await searchParams;
  const orders = filterOrders(await listOrders(), query);
  const queue = isDefaultOrderQueue(query);
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) exportQuery.set(key, value);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{queue ? "Orders to do" : "Orders"}</h1>
          <p className="mt-2 text-sm text-taupe">
            {queue ? "Paid orders that still need packing, delivery, or pickup." : `${orders.length} in this list.`}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          {queue ? (
            <Link href="/admin/orders?view=all" className="underline underline-offset-4">
              All orders
            </Link>
          ) : (
            <Link href="/admin/orders" className="underline underline-offset-4">
              Orders to do
            </Link>
          )}
          <a href={`/admin/orders/export?${exportQuery.toString()}`} className="underline underline-offset-4">
            Export CSV
          </a>
        </div>
      </div>
      <form className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" method="get">
        {query.view ? <input type="hidden" name="view" value={query.view} /> : <input type="hidden" name="view" value="all" />}
        <Input name="q" defaultValue={query.q} placeholder="Order, name, or phone" />
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
      <ul className="mt-6 space-y-3 lg:hidden">
        {orders.map((order) => (
          <li key={order.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/admin/orders/${order.id}`} className="inline-flex min-h-11 items-center font-medium">
                {order.orderNumber}
              </Link>
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
        <p className="mt-8 text-sm text-taupe">{queue ? "No paid orders need action." : "No orders match this filter."}</p>
      ) : null}
    </div>
  );
}
