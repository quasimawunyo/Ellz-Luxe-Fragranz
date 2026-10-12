import Link from "next/link";
import { confirmMoolreIfPaid, getOrderById } from "@/lib/orders/store";
import { isMoolreConfigured } from "@/lib/payments/moolre";
import { isPaystackConfigured } from "@/lib/payments/paystack";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { getAuthContext } from "@/lib/auth/session";
import { canViewOrder } from "@/lib/auth/roles";
import { getStoreSettings } from "@/lib/catalog/queries";
import { orderShippingIsQuoted } from "@/lib/catalog/helpers";
import { annexOrderWhatsAppHref } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  let order = orderId ? await getOrderById(orderId) : null;
  if (order) order = await confirmMoolreIfPaid(order);
  const [auth, settings] = await Promise.all([getAuthContext(), getStoreSettings()]);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Order not found">
          <Link href="/shop">Shop</Link>
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

  const annexWhatsApp = annexOrderWhatsAppHref(settings.contactPhone, order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">Order {order.orderNumber}</h1>
      <p className="mt-4 leading-7 text-taupe">
        Payment status: <strong className="text-espresso">{order.paymentStatus}</strong>.
        {order.paymentStatus === "pending"
          ? isMoolreConfigured()
            ? " This order is not marked paid until Moolre confirms the transaction by callback or status check."
            : isPaystackConfigured()
              ? " This order is not marked paid. Payment is confirmed only after a verified Paystack webhook — never from this page load alone."
              : " This order is not marked paid. Confirm payment on WhatsApp."
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
          <span>Delivery</span>
          {orderShippingIsQuoted(order) ? (
            <span>Quoted for {order.locality}, {order.region}</span>
          ) : /pickup/i.test(order.deliveryMethod) ? (
            <span>Free</span>
          ) : (
            <Price amountMinor={order.shippingMinor} currencyCode={order.currencyCode} />
          )}
        </li>
        <li className="flex justify-between font-medium">
          <span>{orderShippingIsQuoted(order) ? "Goods total" : "Total"}</span>
          <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
        </li>
      </ul>
      <p className="mt-6 text-sm text-taupe">
        Delivering to {order.fullName}, {order.addressLine}, {order.locality}, {order.region}.
      </p>
      {annexWhatsApp ? (
        <p className="mt-8">
          <a href={annexWhatsApp} className={cn(buttonVariants({ variant: "gold" }), "inline-flex")} target="_blank" rel="noreferrer">
            Send this order on WhatsApp
          </a>
          <span className="mt-3 block text-sm text-taupe">
            Opens WhatsApp to {settings.contactPhone} with the order details so the annex can confirm it.
          </span>
        </p>
      ) : null}
    </div>
  );
}
