import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { EmptyState } from "@/components/ui/states";
import { resolveCart } from "@/lib/cart/store";
import { getStoreSettings } from "@/lib/catalog/queries";
import { getAuthContext } from "@/lib/auth/session";
import { isMoolreConfigured } from "@/lib/payments/moolre";
import { isPaystackConfigured } from "@/lib/payments/paystack";
import Link from "next/link";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, settings, auth] = await Promise.all([
    resolveCart(),
    getStoreSettings(),
    getAuthContext(),
  ]);

  if (!cart.lines.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Your cart is empty">
          <Link href="/shop" className="underline">
            Continue shopping
          </Link>
        </EmptyState>
      </div>
    );
  }

  const hosted = isMoolreConfigured() || isPaystackConfigured();
  const payCopy = hosted
    ? "No account needed. Place the order to pay by mobile money or card. Pickup is free. Delivery is quoted on WhatsApp from your location. The order is marked paid only after payment is confirmed."
    : `No account needed. Place the order, then confirm payment and the delivery fee on WhatsApp${settings.contactPhone ? ` ${settings.contactPhone}` : ""}. Pickup is free.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/cart", label: "Cart" }, { label: "Checkout" }]} />
      <h1 className="mt-6 font-serif text-4xl">Checkout</h1>
      <p className="mt-3 max-w-xl text-sm text-taupe">{payCopy}</p>
      <CheckoutView
        fullName={auth.profile?.full_name ?? ""}
        email={auth.email ?? ""}
        lines={cart.lines.map((line) => ({
          variantId: line.variantId,
          productName: line.productName,
          label: line.label,
          quantity: line.quantity,
          lineMinor: line.lineMinor,
        }))}
        subtotalMinor={cart.subtotalMinor}
        currencyCode={cart.currencyCode}
        deliveryMethods={settings.deliveryMethods}
        payLabel={hosted ? "Place order and pay" : "Place order"}
      />
    </div>
  );
}
