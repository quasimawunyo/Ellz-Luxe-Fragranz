import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/auth/roles";
import { getOrderById } from "@/lib/orders/store";
import { Price } from "@/components/ui/price";

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login");
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  if (
    !canViewOrder({
      orderUserId: order.userId,
      orderGuestEmail: order.email,
      actorUserId: auth.user.id,
      actorEmail: auth.email,
      actorRole: auth.role,
    })
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl">{order.orderNumber}</h1>
      <p className="mt-3 text-taupe">
        Payment {order.paymentStatus} · Fulfillment {order.fulfillmentStatus}
      </p>
      <ul className="mt-8 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.sku} className="flex justify-between">
            <span>
              {item.productName} · {item.variantLabel} × {item.quantity}
            </span>
            <Price amountMinor={item.unitPriceMinor * item.quantity} currencyCode={order.currencyCode} />
          </li>
        ))}
      </ul>
      <p className="mt-6">
        Total <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
      </p>
    </div>
  );
}
