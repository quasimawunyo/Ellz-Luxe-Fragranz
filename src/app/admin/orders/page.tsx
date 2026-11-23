import Link from "next/link";
import { OrderDesk } from "@/components/admin/order-desk";
import { listOrders } from "@/lib/orders/store";
import { filterOrders, isDefaultOrderQueue, orderListHeading, type OrderListQuery } from "@/lib/orders/desk";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata = { title: "Orders · Shop desk" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderListQuery>;
}) {
  const query = await searchParams;
  const settings = await getStoreSettings();
  const shop = { email: settings.contactEmail, phone: settings.contactPhone };
  const all = await listOrders();
  const listed = filterOrders(all, { ...query, q: undefined }, shop);
  const searchable = isDefaultOrderQueue({ ...query, q: undefined })
    ? filterOrders(all, { ...query, q: undefined, view: "all" }, shop)
    : listed;
  const queue = isDefaultOrderQueue(query);
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) exportQuery.set(key, value);
  }
  const slim = (orders: typeof listed) =>
    orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      fullName: order.fullName,
      phone: order.phone,
      deliveryMethod: order.deliveryMethod,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      isTest: order.isTest,
      totalMinor: order.totalMinor,
      currencyCode: order.currencyCode,
      createdAt: order.createdAt,
      stockApplied: order.stockApplied,
    }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{orderListHeading(query)}</h1>
          <p className="mt-2 text-sm text-taupe">
            {queue ? "Paid orders that still need packing, delivery, or pickup." : "Orders in this list."}
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
      <OrderDesk listed={slim(listed)} searchable={slim(searchable)} query={query} queue={queue} />
    </div>
  );
}
