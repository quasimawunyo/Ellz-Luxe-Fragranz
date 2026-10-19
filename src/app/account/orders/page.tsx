import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { listOrders } from "@/lib/orders/store";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login?next=/account/orders");
  const orders = await listOrders({ userId: auth.user.id });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-8 space-y-3">
        {orders.length ? (
          orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-[1.25rem] border border-espresso/10 bg-white p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">{order.createdAt.slice(0, 10)}</p>
              <p className="mt-1 font-serif text-2xl">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-taupe">
                {order.paymentStatus} · {order.fulfillmentStatus} ·{" "}
                <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
              </p>
            </Link>
          ))
        ) : (
          <EmptyState title="No orders yet">
            <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "mt-4 inline-flex px-8")}>
              Shop
            </Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
