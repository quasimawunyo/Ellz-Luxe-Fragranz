"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { lowestPrice, primaryImage, totalStock } from "@/lib/catalog/helpers";
import { Price } from "@/components/ui/price";
import { QuickAdd } from "@/components/product/quick-add";
import { LikeButton } from "@/components/product/like-button";
import { WaitlistButton } from "@/components/product/waitlist-button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = primaryImage(product);
  const stock = totalStock(product);
  const price = lowestPrice(product);
  const compare = product.variants.find((variant) => variant.priceMinor === price)?.compareAtMinor;
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const soldOut = stock < 1;

  return (
    <article>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-espresso/5">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
      </Link>
      <p className="mt-4 text-xs text-taupe">{product.brand}</p>
      <h3 className="mt-1 text-base font-medium leading-snug">
        <Link href={`/product/${product.slug}`}>{product.name}</Link>
      </h3>
      {product.isDemonstration ? <p className="mt-1 text-xs text-taupe">Tester</p> : null}
      <Price amountMinor={price} compareAtMinor={compare} className="mt-2 text-sm text-leaf" />
      {soldOut ? <p className="mt-1 text-sm text-taupe">Out of stock</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {soldOut ? (
          <WaitlistButton productId={product.id} />
        ) : defaultVariant ? (
          <QuickAdd variantId={defaultVariant.id} />
        ) : null}
        <LikeButton productId={product.id} name={product.name} />
      </div>
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
    <div className={cn("grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
