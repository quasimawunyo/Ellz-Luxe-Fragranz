import Image from "next/image";
import Link from "next/link";
import { updateCartAction } from "@/app/actions/cart";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ActionForm } from "@/components/forms/form-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import { resolveCart } from "@/lib/cart/store";
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
            <Link href="/shop">Continue shopping</Link>
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
                  <p className="text-sm text-taupe">{line.label}</p>
                  <Price amountMinor={line.unitMinor} currencyCode={cart.currencyCode} className="mt-2 text-sm" />
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
                      className="h-10 w-16 border border-espresso/15 px-2 text-sm"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Update
                    </Button>
                  </ActionForm>
                  <ActionForm action={updateCartAction}>
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <input type="hidden" name="quantity" value="0" />
                    <button type="submit" className="mt-2 text-sm text-taupe">
                      Remove
                    </button>
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
          <aside className="luxe-panel h-fit p-6">
            <p className="text-sm text-taupe">Subtotal</p>
            <p className="mt-2 text-2xl font-semibold">
              <Price amountMinor={cart.subtotalMinor} currencyCode={cart.currencyCode} />
            </p>
            <p className="mt-3 text-sm text-taupe">
              Shipping is calculated at checkout from configured delivery options. Totals are recomputed from catalog prices.
            </p>
            <Link href="/checkout" className={cn(buttonVariants(), "mt-6 flex")}>
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
