import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { getDiscountedProducts } from "@/lib/catalog/queries";

export const metadata = { title: "Discounted perfumes" };

export default async function SalePage() {
  const products = await getDiscountedProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Discounted perfumes" }]} />
      <h1 className="mt-8 font-serif text-4xl">Discounted perfumes</h1>
      <p className="mt-3 max-w-xl text-taupe">
        Bottles currently priced below their previous amount at Ells Luxe Annex.
      </p>
      <div className="mt-10">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="No discounted bottles right now">
            <Link href="/shop">Shop all perfumes</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
