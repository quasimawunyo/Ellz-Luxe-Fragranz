import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";

export const metadata = { title: "Customers · Shop desk" };

export default async function CustomersPage() {
  const orders = (await listOrders()).filter((order) => !order.isTest);
  const people = new Map<string, { name: string; email: string; phone: string; orders: number; last: string; orderId: string; orderNumber: string }>();
  for (const order of orders) {
    const key = order.email.trim().toLowerCase() || order.phone;
    const current = people.get(key);
    if (!current || order.createdAt > current.last) {
      people.set(key, {
        name: order.fullName,
        email: order.email,
        phone: order.phone,
        orders: (current?.orders ?? 0) + 1,
        last: order.createdAt,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } else {
      current.orders += 1;
    }
  }
  const rows = [...people.values()].sort((a, b) => b.last.localeCompare(a.last));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Customers</h1>
      <p className="mt-2 text-sm text-taupe">People who have placed an order. Test orders are left out.</p>
      {rows.length === 0 ? <p className="mt-8 text-sm text-taupe">No customers yet.</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.map((person) => (
          <li key={`${person.email}-${person.phone}`} className="rounded-[1.25rem] border border-espresso/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-taupe">{person.email}</p>
              </div>
              <p className="text-sm text-taupe">{person.orders} {person.orders === 1 ? "order" : "orders"}</p>
            </div>
            <CustomerWhatsApp className="mt-2" phone={person.phone} name={person.name} orderNumber={person.orderNumber} />
            <Link href={`/admin/orders/${person.orderId}`} className="mt-2 inline-flex min-h-11 items-center text-sm text-leaf">
              Latest order
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
