"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { lowestPrice, primaryImage, totalStock } from "@/lib/catalog/helpers";
import { Price } from "@/components/ui/price";
import { QuickAdd } from "@/components/product/quick-add";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = primaryImage(product);
  const stock = totalStock(product);
  const price = lowestPrice(product);
  const compare = product.variants.find((v) => v.priceMinor === price)?.compareAtMinor;
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-espresso/5">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : null}
          {product.isDemonstration ? (
            <span className="absolute left-3 top-3 bg-ivory/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-espresso">
              Demonstration
            </span>
          ) : null}
          {stock < 1 ? (
            <span className="absolute right-3 top-3 bg-espresso px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ivory">
              Out of stock
            </span>
          ) : stock <= 5 ? (
            <span className="absolute right-3 top-3 bg-ivory/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
              Low stock
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-taupe">{product.brand}</p>
          <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
          <Price amountMinor={price} compareAtMinor={compare} className="text-sm" />
        </div>
      </Link>
      {defaultVariant ? <QuickAdd variantId={defaultVariant.id} disabled={stock < 1} /> : null}
    </article>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: CatalogProduct[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
