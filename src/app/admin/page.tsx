import { listOrders } from "@/lib/orders/store";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { formatMoney } from "@/lib/money";
import { isPaidRevenue } from "@/lib/orders/transitions";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([listOrders(), getPublishedProducts()]);
  const paid = orders.filter((order) => isPaidRevenue(order.paymentStatus));
  const pending = orders.filter((order) => order.paymentStatus === "pending");
  const paidRevenue = paid.reduce((sum, order) => sum + order.totalMinor, 0);
  const pendingValue = pending.reduce((sum, order) => sum + order.totalMinor, 0);
  const sales = new Map<string, number>();
  for (const order of paid) {
    for (const item of order.items) {
      sales.set(item.productName, (sales.get(item.productName) ?? 0) + item.quantity);
    }
  }
  const best = [...sales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          { label: "Orders", value: String(orders.length) },
          { label: "Paid revenue", value: formatMoney(paidRevenue) },
          { label: "Pending payments", value: formatMoney(pendingValue) },
          { label: "Published products", value: String(products.length) },
        ].map((card) => (
          <div key={card.label} className="border border-espresso/10 bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-taupe">{card.label}</p>
            <p className="mt-2 font-serif text-3xl">{card.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-taupe">
        Paid revenue includes only webhook-verified paid orders. Pending amounts are not treated as income.
      </p>
      <h2 className="mt-12 font-serif text-3xl">Recent orders</h2>
      <ul className="mt-4 divide-y border border-espresso/10 bg-white">
        {orders.slice(0, 8).map((order) => (
          <li key={order.id} className="flex justify-between px-4 py-3 text-sm">
            <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
            <span>
              {order.paymentStatus} · {formatMoney(order.totalMinor, order.currencyCode)}
            </span>
          </li>
        ))}
        {!orders.length ? <li className="px-4 py-6 text-taupe">No orders yet.</li> : null}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Best sellers (paid only)</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {best.length ? best.map(([name, qty]) => (
          <li key={name}>
            {name} · {qty}
          </li>
        )) : <li className="text-taupe">No paid sales yet.</li>}
      </ul>
    </div>
  );
}
