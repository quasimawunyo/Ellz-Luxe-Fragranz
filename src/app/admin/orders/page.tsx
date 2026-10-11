import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { formatMoney } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/admin/status-pill";

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
      <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Sales</p>
      <h1 className="mt-2 font-serif text-4xl">Orders</h1>
      <form className="mt-6 flex flex-wrap gap-2" method="get">
        <Input name="q" defaultValue={q} placeholder="Search number, email, name, phone" className="max-w-sm" />
        <select name="payment" defaultValue={payment ?? ""} className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="bg-espresso px-4 text-xs uppercase tracking-widest text-ivory" type="submit">
          Filter
        </button>
      </form>
      <div className="mt-8 overflow-x-auto border border-espresso/10 bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-[11px] uppercase tracking-[0.16em] text-taupe">
              <th className="px-4 py-3">Order</th>
              <th>Customer</th>
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
                  <p className="text-taupe">{order.locality}</p>
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
                <td className="px-4 py-10 text-taupe" colSpan={5}>
                  No orders match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
