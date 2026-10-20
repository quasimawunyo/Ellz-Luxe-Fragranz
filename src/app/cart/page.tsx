import Image from "next/image";
import Link from "next/link";
import { updateCartAction } from "@/app/actions/cart";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ActionForm } from "@/components/forms/form-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { resolveCart } from "@/lib/cart/store";
import { publicVariantLabel } from "@/lib/catalog/helpers";
import { cn } from "@/lib/utils";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await resolveCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Cart" }]} />
      <h1 className="mt-6 font-serif text-4xl">Cart</h1>
      {!cart.lines.length ? (
        <div className="mt-10">
            <EmptyState title="Your cart is empty">
            <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "mt-6 inline-flex px-8")}>
              Continue shopping
            </Link>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_18rem]">
          <ul className="space-y-6">
            {cart.lines.map((line) => (
              <li key={line.variantId} className="flex gap-4 border-b border-espresso/10 pb-6">
                <div className="relative size-28 shrink-0 overflow-hidden bg-espresso/5">
                  <Image src={line.imageUrl} alt={line.imageAlt} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${line.productSlug}`} className="font-medium">
                    {line.productName}
                  </Link>
                  {publicVariantLabel(line.label) ? (
                    <p className="text-sm text-taupe">{publicVariantLabel(line.label)}</p>
                  ) : null}
                  <Price
                    amountMinor={line.unitMinor}
                    currencyCode={cart.currencyCode}
                    className="mt-2 text-xl font-semibold text-leaf"
                  />
                  <ActionForm action={updateCartAction} className="mt-3 flex items-center gap-3">
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <label className="sr-only" htmlFor={`qty-${line.variantId}`}>
                      Quantity
                    </label>
                    <input
                      id={`qty-${line.variantId}`}
                      name="quantity"
                      type="number"
                      min={0}
                      max={line.maxQuantity}
                      defaultValue={line.quantity}
                      className="h-11 w-16 border border-espresso/15 px-2 text-sm"
                    />
                    <Button type="submit" variant="outline">
                      Update
                    </Button>
                  </ActionForm>
                  <ActionForm action={updateCartAction}>
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <input type="hidden" name="quantity" value="0" />
                    <button type="submit" className="mt-1 inline-flex min-h-11 items-center text-sm text-taupe">
                      Remove
                    </button>
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
          <aside className="luxe-panel h-fit p-6">
            <p className="text-sm text-taupe">Subtotal</p>
            <p className="mt-2 text-3xl font-semibold text-leaf">
              <Price amountMinor={cart.subtotalMinor} currencyCode={cart.currencyCode} />
            </p>
            <p className="mt-3 text-sm leading-6 text-taupe">
              Pickup is free. Delivery is quoted on WhatsApp from your location after you place the order.
            </p>
            <Link href="/checkout" className={cn(buttonVariants({ variant: "shop" }), "mt-6 flex")}>
              Checkout
            </Link>
            <p className="mt-3 text-xs text-taupe">No account needed.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
