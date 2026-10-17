import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { isNewProduct } from "@/lib/catalog/helpers";

export const metadata = { title: "New arrivals" };

export default async function NewArrivalsPage() {
  const products = (await getPublishedProducts()).filter((product) => isNewProduct(product));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "New arrivals" }]} />
      <h1 className="mt-8 font-serif text-4xl">New arrivals</h1>
      <div className="mt-10">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="No new bottles right now">
            <Link href="/shop">Shop all perfumes</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
