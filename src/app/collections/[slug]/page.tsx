import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { getCollectionProducts } from "@/lib/catalog/queries";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { collection, products } = await getCollectionProducts(slug);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/collections", label: "Collections" },
          { label: collection.name },
        ]}
      />
      <h1 className="mt-6 font-serif text-4xl">{collection.name}</h1>
      <p className="mt-3 max-w-2xl text-taupe">{collection.description}</p>
      <div className="mt-12">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="Nothing in this collection yet" />
        )}
      </div>
    </div>
  );
}
