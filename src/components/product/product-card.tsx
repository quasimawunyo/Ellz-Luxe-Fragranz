"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog/types";
import { isDiscounted, isNewProduct, lowestPrice, primaryImage, shopVariants } from "@/lib/catalog/helpers";
import { isSoldOut } from "@/lib/stock";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { formatMoney } from "@/lib/money";
import { QuickAdd } from "@/components/product/quick-add";
import { LikeButton } from "@/components/product/like-button";
import { WaitlistButton } from "@/components/product/waitlist-button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = primaryImage(product);
  const variants = shopVariants(product);
  const variant = variants.find((item) => !isSoldOut(item)) ?? variants[0];
  const several = variants.length > 1;
  const soldOut = !variant || isSoldOut(variant);
  const badge = soldOut
    ? "Sold out"
    : isDiscounted(product)
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
          <div className="relative aspect-square overflow-hidden bg-espresso/5">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 86vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </Link>
        {badge ? (
          <span
            className={cn(
              "absolute left-3 top-3 px-2 py-1 text-xs",
              soldOut ? "bg-red-800 text-white" : "bg-white text-espresso",
            )}
          >
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
          ) : several ? (
            <Link href={`/product/${product.slug}`} className={cn(buttonVariants({ variant: "shop" }), "w-full")}>
              Add to cart
            </Link>
          ) : variant ? (
            <QuickAdd variantId={variant.id} wide />
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-taupe">{product.brand}</p>
      <h3 className="mt-1 font-serif text-lg leading-snug sm:text-xl">
        <Link href={`/product/${product.slug}`} prefetch>{product.name}</Link>
      </h3>
      {product.isDemonstration && badge !== "Tester" ? (
        <p className="mt-1 text-xs text-taupe">Tester</p>
      ) : null}
      {several ? (
        <p className="mt-3 text-xl font-semibold tracking-tight text-leaf sm:text-[1.75rem]">From {formatMoney(lowestPrice(product))}</p>
      ) : variant ? (
        <Price
          amountMinor={variant.priceMinor}
          compareAtMinor={variant.compareAtMinor}
          showSave
          className="mt-3 text-xl font-semibold tracking-tight text-leaf sm:text-[1.75rem]"
        />
      ) : null}
      <div className="mt-3 lg:hidden">
        {soldOut ? (
          <WaitlistButton productId={product.id} wide />
        ) : several ? (
          <Link href={`/product/${product.slug}`} className={cn(buttonVariants({ variant: "shop" }), "w-full")}>
            Add to cart
          </Link>
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
          className="flex h-full min-h-48 items-center justify-center border border-espresso/15 px-5 text-sm hover:border-espresso"
        >
          <p>View all perfumes</p>
        </Link>
      ) : null}
    </div>
  );
}
