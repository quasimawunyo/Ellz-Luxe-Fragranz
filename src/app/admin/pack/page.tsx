import Link from "next/link";
import { listOrders } from "@/lib/orders/store";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";
import { StatusPill } from "@/components/admin/status-pill";

export const metadata = { title: "Pack desk · Shop desk" };

export default async function PackDeskPage() {
  const orders = (await listOrders())
    .filter((order) => !order.isTest && order.paymentStatus === "paid" && (order.fulfillmentStatus === "new" || order.fulfillmentStatus === "packed"))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Pack desk</h1>
      <p className="mt-2 text-sm text-taupe">Paid orders that still need to be packed or handed on. Oldest first.</p>
      {orders.length === 0 ? <p className="mt-8 text-sm text-taupe">Nothing is waiting to pack.</p> : null}
      <ul className="mt-6 space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/admin/orders/${order.id}`} className="font-medium">
                {order.orderNumber}
              </Link>
              <StatusPill value={order.fulfillmentStatus} />
            </div>
            <p className="mt-1 text-sm">{order.fullName}</p>
            <p className="text-sm text-taupe">{order.deliveryMethod}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={`${item.sku}-${item.variantLabel}`}>
                  {item.productName} · {item.variantLabel} × {item.quantity}
                </li>
              ))}
            </ul>
            <CustomerWhatsApp className="mt-3" phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
          </li>
        ))}
      </ul>
    </div>
  );
}
