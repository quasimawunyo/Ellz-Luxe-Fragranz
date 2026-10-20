import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/admin/status-pill";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";

export const metadata = { title: "Orders · Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; payment?: string }>;
}) {
  const { q, payment } = await searchParams;
  let orders = await listOrders();
  if (q) {
    const query = q.toLowerCase();
    orders = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.fullName.toLowerCase().includes(query) ||
        order.phone.includes(query),
    );
  }
  if (payment) {
    orders = orders.filter((order) => order.paymentStatus === payment);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mt-2 text-sm text-taupe">Open an order to mark WhatsApp payment received.</p>
      <form className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap" method="get">
        <Input name="q" defaultValue={q} placeholder="Search number, email, name, phone" className="w-full sm:max-w-sm" />
        <select name="payment" defaultValue={payment ?? ""} className="min-h-11 w-full border border-espresso/12 bg-white px-3 text-sm sm:w-auto">
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <Button type="submit" className="w-full sm:w-auto">
          Filter
        </Button>
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
            <p className="text-sm text-taupe">
              {order.locality}, {order.region}
            </p>
            <CustomerWhatsApp className="mt-1" phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusPill value={order.paymentStatus} />
              <StatusPill value={order.fulfillmentStatus} />
            </div>
          </li>
        ))}
        {!orders.length ? (
          <li className="rounded-[1.25rem] border border-espresso/10 bg-white px-4 py-10 text-center text-sm text-taupe">
            {q || payment ? "No orders match this filter." : "No orders yet."}
          </li>
        ) : null}
      </ul>
      <div className="luxe-panel mt-8 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs text-taupe">
              <th className="px-4 py-3">Order</th>
              <th>Customer</th>
              <th>WhatsApp</th>
              <th>Payment</th>
              <th>Fulfillment</th>
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
                    {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeZone: "Africa/Accra" }).format(
                      new Date(order.createdAt),
                    )}
                  </p>
                </td>
                <td>
                  <p>{order.fullName}</p>
                  <p className="text-taupe">{order.email}</p>
                  <p className="text-taupe">
                    {order.locality}, {order.region}
                  </p>
                </td>
                <td>
                  <CustomerWhatsApp phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
                </td>
                <td>
                  <StatusPill value={order.paymentStatus} />
                </td>
                <td>
                  <StatusPill value={order.fulfillmentStatus} />
                </td>
                <td>{formatMoney(order.totalMinor, order.currencyCode)}</td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td className="px-6 py-12 text-center text-sm text-taupe" colSpan={6}>
                  {q || payment ? "No orders match this filter." : "No orders yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
