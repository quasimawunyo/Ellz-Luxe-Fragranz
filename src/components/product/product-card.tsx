"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { isNewProduct, lowestPrice, primaryImage, totalStock } from "@/lib/catalog/helpers";
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
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">{product.brand}</p>
          <h3 className="mt-1 font-serif text-xl leading-snug">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          {product.isDemonstration ? <p className="mt-1 text-xs text-taupe">Tester</p> : null}
          {isNewProduct(product) && !product.isDemonstration ? (
            <p className="mt-1 text-xs text-taupe">New</p>
          ) : null}
          <p className="mt-2 text-sm">
            <Price amountMinor={price} compareAtMinor={compare} className="text-sm font-normal text-espresso" />
          </p>
        </div>
        <LikeButton productId={product.id} name={product.name} className="size-9 shrink-0 text-espresso" />
      </div>
      <div className="mt-3">
        {soldOut ? (
          <WaitlistButton productId={product.id} wide />
        ) : defaultVariant ? (
          <QuickAdd variantId={defaultVariant.id} wide />
        ) : null}
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
    <div className={cn("grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
