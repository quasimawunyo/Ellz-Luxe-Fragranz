import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { HOUSE_BRANDS, getHouseBrand } from "@/lib/catalog/brands";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return HOUSE_BRANDS.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getHouseBrand(slug);
  if (!brand) return { title: "Brand" };
  return pageMetadata({
    title: brand.name,
    description: `Shop ${brand.name} bottles at EllzLuxe Fragranz.`,
    path: `/brands/${brand.slug}`,
    image: brand.logo,
  });
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getHouseBrand(slug);
  if (!brand) notFound();

  const products = (await getPublishedProducts()).filter(
    (product) => product.brand.toLowerCase() === brand.name.toLowerCase(),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/brands", label: "Brands" },
          { label: brand.name },
        ]}
      />
      <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {brand.logo ? (
          <Image
            src={brand.logo}
            alt=""
            aria-hidden
            width={160}
            height={160}
            unoptimized
            className="h-24 w-auto object-contain"
          />
        ) : null}
        <div>
          <h1 className="font-serif text-4xl">{brand.name}</h1>
          <p className="mt-3 max-w-xl text-taupe">
            Bottles currently listed.
          </p>
        </div>
      </div>
      <div className="mt-12">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="No bottles listed yet" />
        )}
      </div>
    </div>
  );
}
