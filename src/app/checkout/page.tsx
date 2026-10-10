import { placeOrderAction } from "@/app/actions/checkout";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { resolveCart } from "@/lib/cart/store";
import { getStoreSettings } from "@/lib/catalog/queries";
import { getAuthContext } from "@/lib/auth/session";
import { GHANA_REGIONS } from "@/lib/ghana";
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
        <EmptyState title="Nothing to check out">
          <Link href="/shop">Return to the shop</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/cart", label: "Cart" }, { label: "Checkout" }]} />
      <h1 className="mt-6 font-serif text-5xl">Checkout</h1>
      <p className="mt-3 max-w-xl text-sm text-taupe">
        {isMoolreConfigured()
          ? " Place the order to pay on Moolre (mobile money and cards). The order is marked paid only after Moolre confirms the payment."
          : isPaystackConfigured()
            ? " Place the order to pay with Paystack. The order is marked paid only after a verified webhook."
            : ` Place the order, then confirm payment on WhatsApp${settings.contactPhone ? ` ${settings.contactPhone}` : ""}.`}
      </p>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <ActionForm action={placeOrderAction} className="space-y-5">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required defaultValue={auth.profile?.full_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue={auth.email ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required placeholder="024 000 0000" />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <select id="region" name="region" required className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm">
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="locality">Locality / city</Label>
            <Input id="locality" name="locality" required placeholder="East Legon" />
          </div>
          <div>
            <Label htmlFor="addressLine">Street address</Label>
            <Input id="addressLine" name="addressLine" required />
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs uppercase tracking-[0.16em] text-taupe">Delivery</legend>
            {settings.deliveryMethods.map((method) => (
              <label key={method.id} className="flex cursor-pointer items-start gap-3 border border-espresso/10 p-3">
                <input type="radio" name="deliveryMethodId" value={method.id} required defaultChecked={method.id === "accra"} />
                <span>
                  <span className="block font-medium">{method.label}</span>
                  <span className="text-sm text-taupe">{method.description}</span>
                  <span className="mt-1 block text-sm">
                    <Price amountMinor={method.amountMinor} currencyCode={settings.currencyCode} />
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          <div>
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <Button type="submit">{isMoolreConfigured() ? "Place order and pay" : "Place order"}</Button>
        </ActionForm>
        <aside className="h-fit border border-espresso/10 bg-white p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.lines.map((line) => (
              <li key={line.variantId} className="flex justify-between gap-3">
                <span>
                  {line.productName} · {line.label} × {line.quantity}
                </span>
                <Price amountMinor={line.lineMinor} currencyCode={cart.currencyCode} />
              </li>
            ))}
          </ul>
          <p className="mt-6 flex justify-between border-t border-espresso/10 pt-4">
            <span>Subtotal</span>
            <Price amountMinor={cart.subtotalMinor} currencyCode={cart.currencyCode} />
          </p>
        </aside>
      </div>
    </div>
  );
}
