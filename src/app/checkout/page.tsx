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
          <Link href="/shop">Return to the shop</Link>
        </EmptyState>
      </div>
    );
  }

  const payCopy = isMoolreConfigured()
    ? " Place the order to pay on Moolre (mobile money and cards). The order is marked paid only after Moolre confirms the payment."
    : isPaystackConfigured()
      ? " Place the order to pay with Paystack. The order is marked paid only after a verified webhook."
      : ` Place the order, then confirm payment on WhatsApp${settings.contactPhone ? ` ${settings.contactPhone}` : ""}.`;

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
        payLabel={isMoolreConfigured() ? "Place order and pay" : "Place order"}
      />
    </div>
  );
}
