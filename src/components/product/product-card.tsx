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
  const badge = product.featured
    ? "Featured"
    : isNewProduct(product)
      ? "New"
      : product.isDemonstration
        ? "Tester"
        : null;

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-espresso/5">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
            ) : null}
          </div>
        </Link>
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso">
            {badge}
          </span>
        ) : null}
        <LikeButton
          productId={product.id}
          name={product.name}
          className="absolute right-3 top-3 size-9 rounded-full bg-white/90 text-espresso hover:bg-white"
        />
        <div className="absolute inset-x-3 bottom-3 hidden opacity-0 transition group-hover:opacity-100 lg:block lg:group-hover:opacity-100">
          {soldOut ? (
            <WaitlistButton productId={product.id} wide />
          ) : defaultVariant ? (
            <QuickAdd variantId={defaultVariant.id} wide />
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-taupe">{product.brand}</p>
      <h3 className="mt-1 font-serif text-xl leading-snug">
        <Link href={`/product/${product.slug}`}>{product.name}</Link>
      </h3>
      {product.isDemonstration && badge !== "Tester" ? (
        <p className="mt-1 text-xs text-taupe">Tester</p>
      ) : null}
      <p className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-taupe">From</span>
        <Price
          amountMinor={price}
          compareAtMinor={compare}
          className="text-2xl font-semibold tracking-tight text-leaf sm:text-[1.75rem]"
        />
      </p>
      <div className="mt-3 lg:hidden">
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
  viewAllHref,
}: {
  products: CatalogProduct[];
  className?: string;
  viewAllHref?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-12 sm:grid-cols-2",
        viewAllHref ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="flex min-h-[22rem] flex-col justify-between rounded-[1.5rem] bg-leaf p-8 text-snow transition hover:bg-leaf/90"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-champagne">Shop</p>
          <div>
            <p className="font-serif text-4xl leading-tight">View all products</p>
            <p className="mt-3 text-sm leading-6 text-snow/80">Every bottle at Ells Luxe Annex.</p>
          </div>
          <span className="text-sm text-champagne">Open shop</span>
        </Link>
      ) : null}
    </div>
  );
}
