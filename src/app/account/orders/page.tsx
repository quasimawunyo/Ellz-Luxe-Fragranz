import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { listOrders } from "@/lib/orders/store";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login?next=/account/orders");
  const orders = await listOrders({ userId: auth.user.id });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl">Your orders</h1>
      <div className="mt-10 space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-espresso/10 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-taupe">{order.createdAt.slice(0, 10)}</p>
              <p className="font-serif text-2xl">{order.orderNumber}</p>
              <p className="text-sm">
                {order.paymentStatus} · {order.fulfillmentStatus} ·{" "}
                <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
              </p>
            </Link>
          ))
        ) : (
          <EmptyState title="No orders yet">
            <Link href="/shop">Start with the catalog</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
