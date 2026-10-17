import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/gallery";
import { ProductGrid } from "@/components/product/product-card";
import { PurchaseForm } from "@/components/product/purchase-form";
import { sellingVariant } from "@/lib/catalog/helpers";
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
  const variant = sellingVariant(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((image) => image.url),
    offers: variant
      ? {
          "@type": "Offer",
          sku: variant.sku,
          priceCurrency: settings.currencyCode,
          price: (variant.priceMinor / 100).toFixed(2),
          availability:
            variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }
      : undefined,
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
        <div>
          {product.isDemonstration ? (
            <p className="text-sm text-taupe">Tester</p>
          ) : null}
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-taupe">
            {product.brand}
            {product.concentration ? ` · ${product.concentration}` : ""}
          </p>
          <p className="mt-6 max-w-lg leading-7 text-espresso/80">{product.description}</p>
          <PurchaseForm
            variants={variant ? [variant] : []}
            productId={product.id}
            productName={product.name}
            currencyCode={settings.currencyCode}
          />
          {product.notes.top.length || product.notes.heart.length || product.notes.base.length ? (
            <dl className="mt-10 space-y-4 border-t border-espresso/10 pt-8 text-sm">
              {product.notes.top.length ? (
                <div>
                  <dt className="text-sm text-taupe">Top notes</dt>
                  <dd>{product.notes.top.join(", ")}</dd>
                </div>
              ) : null}
              {product.notes.heart.length ? (
                <div>
                  <dt className="text-sm text-taupe">Heart notes</dt>
                  <dd>{product.notes.heart.join(", ")}</dd>
                </div>
              ) : null}
              {product.notes.base.length ? (
                <div>
                  <dt className="text-sm text-taupe">Base notes</dt>
                  <dd>{product.notes.base.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
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
      <p className="mt-10 text-sm">
        <Link href="/shop">Back to shop</Link>
      </p>
    </div>
  );
}
