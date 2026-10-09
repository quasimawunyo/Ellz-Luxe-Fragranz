import Link from "next/link";
import { getOrderById } from "@/lib/orders/store";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { getAuthContext } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/auth/roles";

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;
  const auth = await getAuthContext();

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Order not found">
          <Link href="/shop">Continue shopping</Link>
        </EmptyState>
      </div>
    );
  }

  const allowed =
    canViewOrder({
      orderUserId: order.userId,
      orderGuestEmail: order.email,
      actorUserId: auth.user?.id ?? null,
      actorEmail: auth.email,
      actorRole: auth.role,
    }) ||
    (!order.userId && !auth.user);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="This confirmation is private">
          <Link href="/login">Sign in</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Thank you</p>
      <h1 className="mt-3 font-serif text-5xl">Order {order.orderNumber}</h1>
      <p className="mt-4 leading-7 text-taupe">
        Payment status: <strong className="text-espresso">{order.paymentStatus}</strong>.
        {order.paymentStatus === "pending"
          ? " This order is not marked paid. Payment is confirmed only after a verified Paystack webhook — never from this page load alone."
          : " Payment was verified server-side."}
      </p>
      <ul className="mt-8 space-y-2 border border-espresso/10 bg-white p-6 text-sm">
        {order.items.map((item) => (
          <li key={item.sku} className="flex justify-between">
            <span>
              {item.productName} · {item.variantLabel} × {item.quantity}
            </span>
            <Price amountMinor={item.unitPriceMinor * item.quantity} currencyCode={order.currencyCode} />
          </li>
        ))}
        <li className="flex justify-between border-t border-espresso/10 pt-3">
          <span>Shipping</span>
          <Price amountMinor={order.shippingMinor} currencyCode={order.currencyCode} />
        </li>
        <li className="flex justify-between font-medium">
          <span>Total</span>
          <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
        </li>
      </ul>
      <p className="mt-6 text-sm text-taupe">
        Delivering to {order.fullName}, {order.addressLine}, {order.locality}, {order.region}.
      </p>
    </div>
  );
}
