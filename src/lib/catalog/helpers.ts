import { brandMatches } from "@/lib/catalog/brands";
import type { ShopFilters } from "@/lib/validations";
import type { CatalogProduct as Product } from "@/lib/catalog/types";
import { isSoldOut } from "@/lib/stock";

export const PAGE_SIZE = 9;

export function deliveryIsQuoted(method: { id: string; amountMinor: number }) {
  return method.id !== "pickup" && method.amountMinor === 0;
}

export function orderShippingIsQuoted(order: { shippingMinor: number; deliveryMethod: string }) {
  return order.shippingMinor === 0 && !/pickup/i.test(order.deliveryMethod);
}

const SIZE_ONLY_LABEL = /^\d+\s*ml$/i;

export function isSizeOnlyLabel(label: string) {
  return SIZE_ONLY_LABEL.test(label.trim());
}

export function publicVariantLabel(label: string) {
  return isSizeOnlyLabel(label) ? "" : label;
}

export function shopVariants(product: Product) {
  return [...product.variants]
    .filter((variant) => variant.visible !== false)
    .sort((a, b) => (a.sizeMl ?? 0) - (b.sizeMl ?? 0) || a.priceMinor - b.priceMinor);
}

export function sellingVariant(product: Product) {
  const variants = shopVariants(product);
  return variants.find((variant) => !isSoldOut(variant)) ?? variants[0];
}

export function lowestPrice(product: Product) {
  const variants = shopVariants(product);
  if (!variants.length) return Math.min(...product.variants.map((variant) => variant.priceMinor));
  return Math.min(...variants.map((variant) => variant.priceMinor));
}

export function totalStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + (variant.trackStock ? variant.stockQuantity : 0), 0);
}

export function primaryImage(product: Product) {
  return [...product.images].sort((a, b) => a.position - b.position)[0];
}

const NEW_MS = 21 * 24 * 60 * 60 * 1000;

export function isNewProduct(product: Product, now = Date.now()) {
  if (product.newArrival) return true;
  const created = new Date(product.createdAt).getTime();
  return Number.isFinite(created) && now - created < NEW_MS;
}

export function homepageNewArrivals(products: Product[], now = Date.now()) {
  return products
    .filter((product) => product.status === "published" && isNewProduct(product, now))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function stockedCollections<T extends { id: string }>(
  collections: T[],
  products: Pick<Product, "collectionIds" | "status">[],
) {
  const stocked = new Set(
    products
      .filter((product) => product.status === "published")
      .flatMap((product) => product.collectionIds),
  );
  return collections.filter((collection) => stocked.has(collection.id));
}

export function stockedCategories<T extends { id: string }>(
  categories: T[],
  products: Pick<Product, "categoryId" | "status">[],
) {
  const stocked = new Set(
    products
      .filter((product) => product.status === "published" && product.categoryId)
      .map((product) => product.categoryId),
  );
  return categories.filter((category) => stocked.has(category.id));
}

export function publicDescription(description: string) {
  return description
    .replace(/\s*Photographed from the house bottle(?: and matching spray)?\./gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sizeListLabel(sizes: number[]) {
  const unique = [...new Set(sizes.filter((size) => size > 0))].sort((a, b) => a - b);
  if (!unique.length) return "";
  if (unique.length === 1) return `${unique[0]} ml`;
  if (unique.length === 2) return `${unique[0]} ml and ${unique[1]} ml`;
  return `${unique.slice(0, -1).map((size) => `${size} ml`).join(", ")}, and ${unique[unique.length - 1]} ml`;
}

export function shelfDescription(product: Product) {
  const text = publicDescription(product.description).replace(/,?\s*\d+\s*ml(?:\s+and\s+\d+\s*ml)*\.?$/i, "");
  const sizes = shopVariants(product).flatMap((variant) => (variant.sizeMl ? [variant.sizeMl] : []));
  const sizeBit = sizeListLabel(sizes);
  if (!sizeBit) return text;
  if (/\d+\s*ml\b/i.test(text) || text.includes(". ") || /notes/i.test(text)) return text;
  const concentration = product.concentration?.trim();
  const hasConcentration = concentration ? text.toLowerCase().includes(concentration.toLowerCase()) : true;
  const concentrationBit = !hasConcentration && concentration ? ` ${concentration.toLowerCase()}` : "";
  return `${text.replace(/\.\s*$/, "")}${concentrationBit}, ${sizeBit}.`;
}

export function bottleSizeLabel(variant: { sizeMl?: number | null; label?: string } | null | undefined) {
  if (!variant) return "";
  if (variant.sizeMl) return `${variant.sizeMl} ml`;
  if (variant.label && isSizeOnlyLabel(variant.label)) return variant.label.trim();
  return "";
}

export function isDiscounted(product: Product) {
  return discountedVariantOffers(product).length > 0;
}

export function discountedVariantOffers(product: Product) {
  return shopVariants(product).filter((variant) => variant.compareAtMinor != null && variant.compareAtMinor > variant.priceMinor);
}

export function searchHaystack(product: Product) {
  return [
    product.name,
    product.description,
    product.brand,
    product.concentration ?? "",
    ...product.notes.top,
    ...product.notes.heart,
    ...product.notes.base,
    ...shopVariants(product).map((variant) => variant.sku),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterProducts(
  products: Product[],
  filters: ShopFilters,
  collectionProductIds?: Set<string>,
) {
  let result = products.filter((product) => product.status === "published");

  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((product) => searchHaystack(product).includes(q));
  }
  if (filters.category) {
    result = result.filter((product) => product.categoryId === filters.category);
  }
  if (filters.brand) {
    result = result.filter((product) => brandMatches(product.brand, filters.brand!));
  }
  if (filters.collection && collectionProductIds) {
    result = result.filter((product) => collectionProductIds.has(product.id));
  } else if (filters.collection) {
    result = result.filter((product) =>
      product.collectionIds.includes(filters.collection!),
    );
  }
  if (filters.min !== undefined) {
    result = result.filter((product) => lowestPrice(product) >= filters.min!);
  }
  if (filters.max !== undefined) {
    result = result.filter((product) => lowestPrice(product) <= filters.max!);
  }
  if (filters.arrival === "1") {
    result = result.filter((product) => isNewProduct(product));
  }

  switch (filters.sort) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "price-asc":
      result.sort((a, b) => lowestPrice(a) - lowestPrice(b));
      break;
    case "price-desc":
      result.sort((a, b) => lowestPrice(b) - lowestPrice(a));
      break;
    default:
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return result;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function takeUniqueBottles<T extends { id: string }>(
  products: T[],
  seenIds: Set<string>,
  seenPictures: Set<string>,
  pictureOf: (product: T) => string | null | undefined,
  limit?: number,
) {
  const picked: T[] = [];
  for (const product of products) {
    if (seenIds.has(product.id)) continue;
    const picture = pictureOf(product) ?? "";
    if (picture && seenPictures.has(picture)) continue;
    seenIds.add(product.id);
    if (picture) seenPictures.add(picture);
    picked.push(product);
    if (limit != null && picked.length >= limit) break;
  }
  return picked;
}

export function unusedPicture(candidates: Array<string | null | undefined>, seenPictures: Set<string>) {
  const picture = candidates.find((url) => url && !seenPictures.has(url)) ?? null;
  if (picture) seenPictures.add(picture);
  return picture;
}

export function relatedProducts(product: Product, catalog: Product[], limit = 4) {
  const seenIds = new Set<string>([product.id]);
  const seenPictures = new Set<string>();
  const current = primaryImage(product)?.url;
  if (current) seenPictures.add(current);
  return takeUniqueBottles(
    catalog.filter(
      (candidate) =>
        candidate.status === "published" &&
        candidate.collectionIds.some((id) => product.collectionIds.includes(id)),
    ),
    seenIds,
    seenPictures,
    (candidate) => primaryImage(candidate)?.url,
    limit,
  );
}
