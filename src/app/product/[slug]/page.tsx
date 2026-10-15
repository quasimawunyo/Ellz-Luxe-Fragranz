import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/gallery";
import { ProductGrid } from "@/components/product/product-card";
import { PurchaseForm } from "@/components/product/purchase-form";
import { getProductBySlug, getRelated, getStoreSettings } from "@/lib/catalog/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { title: product.name, description: product.description.slice(0, 160) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, settings] = await Promise.all([getRelated(product), getStoreSettings()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((image) => image.url),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      priceCurrency: settings.currencyCode,
      price: (variant.priceMinor / 100).toFixed(2),
      availability:
        variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lg:sticky lg:top-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">
            {product.brand}
            {product.concentration ? ` · ${product.concentration}` : ""}
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{product.name}</h1>
          {product.isDemonstration ? <p className="mt-2 text-sm text-taupe">Tester</p> : null}
          <p className="mt-6 max-w-lg leading-7 text-espresso/80">{product.description}</p>
          <PurchaseForm
            variants={product.variants}
            productId={product.id}
            productName={product.name}
            currencyCode={settings.currencyCode}
          />
          <dl className="mt-12 grid gap-8 border-t border-espresso/10 pt-8 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-taupe">Top</dt>
              <dd className="mt-2 leading-6">{product.notes.top.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-taupe">Heart</dt>
              <dd className="mt-2 leading-6">{product.notes.heart.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-taupe">Base</dt>
              <dd className="mt-2 leading-6">{product.notes.base.join(", ")}</dd>
            </div>
          </dl>
          <div className="mt-8 space-y-3 text-sm leading-7 text-taupe">
            <p>{settings.shippingNote}</p>
            <p>{settings.returnsNote}</p>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="mt-20">
          <h2 className="font-serif text-3xl">More bottles</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
      <p className="mt-16 text-sm text-taupe">
        <Link href="/shop">Shop</Link>
      </p>
    </div>
  );
}
