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

function Badge({ children, tone }: { children: string; tone: "light" | "green" | "dark" }) {
  const styles = {
    light: "bg-white text-espresso",
    green: "bg-leaf text-white",
    dark: "bg-espresso text-ivory",
  }[tone];
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", styles)}>
      {children}
    </span>
  );
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = primaryImage(product);
  const stock = totalStock(product);
  const price = lowestPrice(product);
  const compare = product.variants.find((variant) => variant.priceMinor === price)?.compareAtMinor;
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const soldOut = stock < 1;

  return (
    <article>
      <div className="relative overflow-hidden rounded-2xl bg-espresso/5">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square">
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
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {product.featured ? <Badge tone="light">Featured</Badge> : null}
          {isNewProduct(product) ? <Badge tone="green">New</Badge> : null}
          {product.isDemonstration ? <Badge tone="dark">Tester</Badge> : null}
        </div>
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
          {soldOut ? (
            <WaitlistButton productId={product.id} overlay />
          ) : defaultVariant ? (
            <QuickAdd variantId={defaultVariant.id} overlay />
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-taupe">
        {product.categoryName ?? product.brand}
      </p>
      <h3 className="mt-1 font-serif text-2xl leading-snug">
        <Link href={`/product/${product.slug}`} className="hover:text-leaf">
          {product.name}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-taupe">{product.description}</p>
      <Price amountMinor={price} compareAtMinor={compare} className="mt-3 text-lg font-medium text-leaf" />
      <p className="mt-1 text-sm text-taupe">{soldOut ? "Out of stock" : "In stock"}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {soldOut ? (
          <WaitlistButton productId={product.id} />
        ) : defaultVariant ? (
          <QuickAdd variantId={defaultVariant.id} />
        ) : null}
        <Link href={`/product/${product.slug}`} className="text-sm font-medium underline-offset-4 hover:text-leaf hover:underline">
          Details
        </Link>
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
    <div className={cn("grid gap-x-8 gap-y-12 sm:grid-cols-2", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
