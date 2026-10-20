"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { isDiscounted, isNewProduct, primaryImage, sellingVariant } from "@/lib/catalog/helpers";
import { Price } from "@/components/ui/price";
import { QuickAdd } from "@/components/product/quick-add";
import { LikeButton } from "@/components/product/like-button";
import { WaitlistButton } from "@/components/product/waitlist-button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = primaryImage(product);
  const variant = sellingVariant(product);
  const soldOut = !variant || variant.stock < 1;
  const badge = isDiscounted(product)
    ? "Sale"
    : isNewProduct(product)
      ? "New"
      : product.isDemonstration
        ? "Tester"
        : null;

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/product/${product.slug}`} prefetch className="block">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-espresso/5">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 86vw"
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
          className="absolute right-2 top-2 size-11 rounded-full bg-white/90 text-espresso hover:bg-white sm:right-3 sm:top-3"
        />
        <div className="absolute inset-x-3 bottom-3 hidden opacity-0 transition group-hover:opacity-100 lg:block lg:group-hover:opacity-100">
          {soldOut ? (
            <WaitlistButton productId={product.id} wide />
          ) : variant ? (
            <QuickAdd variantId={variant.id} wide />
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-taupe">{product.brand}</p>
      <h3 className="mt-1 font-serif text-lg leading-snug sm:text-xl">
        <Link href={`/product/${product.slug}`} prefetch>{product.name}</Link>
      </h3>
      {product.isDemonstration && badge !== "Tester" ? (
        <p className="mt-1 text-xs text-taupe">Tester</p>
      ) : null}
      {variant ? (
        <Price
          amountMinor={variant.priceMinor}
          compareAtMinor={variant.compareAtMinor}
          className="mt-3 text-xl font-semibold tracking-tight text-leaf sm:text-[1.75rem]"
        />
      ) : null}
      <div className="mt-3 lg:hidden">
        {soldOut ? (
          <WaitlistButton productId={product.id} wide />
        ) : variant ? (
          <QuickAdd variantId={variant.id} wide />
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
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:gap-y-12",
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
          className="flex h-full min-h-48 items-end rounded-[1.5rem] bg-leaf p-5 text-snow transition hover:bg-leaf/90 sm:min-h-72 sm:p-8"
        >
          <p className="font-serif text-3xl leading-tight sm:text-4xl">View all perfumes</p>
        </Link>
      ) : null}
    </div>
  );
}
