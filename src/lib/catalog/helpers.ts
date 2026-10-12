import { brandMatches } from "@/lib/catalog/brands";
import type { ShopFilters } from "@/lib/validations";
import type { CatalogProduct as Product } from "@/lib/catalog/types";

export const PAGE_SIZE = 9;

export function deliveryIsQuoted(method: { id: string; amountMinor: number }) {
  return method.id !== "pickup" && method.amountMinor === 0;
}

export function orderShippingIsQuoted(order: { shippingMinor: number; deliveryMethod: string }) {
  return order.shippingMinor === 0 && !/pickup/i.test(order.deliveryMethod);
}

export function lowestPrice(product: Product) {
  return Math.min(...product.variants.map((variant) => variant.priceMinor));
}

export function totalStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function primaryImage(product: Product) {
  return [...product.images].sort((a, b) => a.position - b.position)[0];
}

const NEW_MS = 21 * 24 * 60 * 60 * 1000;

export function isNewProduct(product: Product, now = Date.now()) {
  const created = new Date(product.createdAt).getTime();
  return Number.isFinite(created) && now - created < NEW_MS;
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
    ...product.variants.map((variant) => variant.sku),
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

export function relatedProducts(product: Product, catalog: Product[], limit = 4) {
  return catalog
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.status === "published" &&
        candidate.collectionIds.some((id) => product.collectionIds.includes(id)),
    )
    .slice(0, limit);
}
