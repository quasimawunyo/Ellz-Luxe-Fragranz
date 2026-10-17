import Image from "next/image";
import Link from "next/link";
import { primaryImage } from "@/lib/catalog/helpers";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/money";

const PREFERRED = [
  "yara",
  "hawas-black",
  "club-de-nuit-intense-man",
  "silverado-21",
  "aventos-blue-for-him",
  "island-sun",
  "fire-on-ice",
  "badee-al-oud-sublime",
];

export function picturesForFlashSales(products: CatalogProduct[], limit: number) {
  const withImages = products.filter((product) => primaryImage(product));
  const preferred = PREFERRED.flatMap((slug) => withImages.filter((product) => product.slug === slug));
  const rest = withImages.filter((product) => !preferred.some((picked) => picked.id === product.id));
  const unique = [...preferred, ...rest].filter(
    (product, index, all) => all.findIndex((item) => item.id === product.id) === index,
  );
  return unique.slice(0, limit);
}

export function FlashSales({ products }: { products: CatalogProduct[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => {
        const image = primaryImage(product);
        const variants = [...product.variants].sort((a, b) => (a.sizeMl ?? 0) - (b.sizeMl ?? 0));
        return (
          <Link key={product.id} href={`/product/${product.slug}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-espresso/5">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rich/80 via-rich/35 to-transparent p-4 text-snow">
                <p className="text-[10px] uppercase tracking-[0.18em] text-champagne">{product.brand}</p>
                <p className="mt-1 font-serif text-2xl leading-tight">{product.name}</p>
                <p className="mt-2 space-y-0.5 text-sm font-semibold">
                  {variants.map((variant) => (
                    <span key={variant.id} className="flex flex-wrap items-baseline gap-2">
                      {variants.length > 1 ? (
                        <span className="text-[11px] uppercase tracking-[0.14em] text-snow/70">{variant.label}</span>
                      ) : null}
                      <span>{formatMoney(variant.priceMinor)}</span>
                      {variant.compareAtMinor != null && variant.compareAtMinor > variant.priceMinor ? (
                        <span className="text-snow/60 line-through">{formatMoney(variant.compareAtMinor)}</span>
                      ) : null}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
