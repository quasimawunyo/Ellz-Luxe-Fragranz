import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { formatMoney } from "@/lib/money";
import { Input } from "@/components/ui/input";

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
        order.fullName.toLowerCase().includes(query),
    );
  }
  if (payment) {
    orders = orders.filter((order) => order.paymentStatus === payment);
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <form className="mt-6 flex gap-2" method="get">
        <Input name="q" defaultValue={q} placeholder="Search number, email, name" />
        <select name="payment" defaultValue={payment ?? ""} className="border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="bg-espresso px-4 text-sm uppercase tracking-widest text-ivory" type="submit">
          Filter
        </button>
      </form>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-widest text-taupe">
            <th className="py-3">Order</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Fulfillment</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-espresso/10">
              <td className="py-3">
                <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
              </td>
              <td>{order.fullName}</td>
              <td>{order.paymentStatus}</td>
              <td>{order.fulfillmentStatus}</td>
              <td>{formatMoney(order.totalMinor, order.currencyCode)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
