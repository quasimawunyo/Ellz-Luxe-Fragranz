import { ProductCard } from "@/components/product/product-card";
import { primaryImage } from "@/lib/catalog/helpers";
import type { CatalogProduct } from "@/lib/catalog/types";

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
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
