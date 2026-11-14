import type { CatalogProduct, ProductVariant } from "@/lib/catalog/types";

export const DEFAULT_LOW_STOCK_THRESHOLD = 3;
export const SCARCE_STOREFRONT_AT = 5;
export const CART_QUANTITY_CAP = 6;

export type StockState = "not_tracked" | "out_of_stock" | "low_stock" | "in_stock";

export function lowStockThreshold(variant: Pick<ProductVariant, "lowStockThreshold">) {
  return variant.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
}

export function stockState(variant: Pick<ProductVariant, "trackStock" | "stockQuantity" | "lowStockThreshold">): StockState {
  if (!variant.trackStock) return "not_tracked";
  if (variant.stockQuantity <= 0) return "out_of_stock";
  if (variant.stockQuantity <= lowStockThreshold(variant)) return "low_stock";
  return "in_stock";
}

export function isSoldOut(variant: Pick<ProductVariant, "trackStock" | "stockQuantity" | "lowStockThreshold">) {
  return stockState(variant) === "out_of_stock";
}

export function productHasSellableVariant(product: Pick<CatalogProduct, "variants">) {
  return product.variants.some((variant) => !isSoldOut(variant));
}

export function maxPurchasable(variant: Pick<ProductVariant, "trackStock" | "stockQuantity">) {
  if (!variant.trackStock) return CART_QUANTITY_CAP;
  return Math.min(CART_QUANTITY_CAP, Math.max(0, variant.stockQuantity));
}

export function storefrontStockLabel(variant: Pick<ProductVariant, "trackStock" | "stockQuantity">) {
  if (!variant.trackStock) return "In stock";
  if (variant.stockQuantity <= 0) return "Out of stock";
  if (variant.stockQuantity <= SCARCE_STOREFRONT_AT) return `Only ${variant.stockQuantity} left`;
  return "In stock";
}

export function stockLimitMessage(name: string, label: string, available: number) {
  const bottle = `${name} (${label})`;
  if (available < 1) return `${bottle} is out of stock.`;
  return `Only ${available} of ${bottle} ${available === 1 ? "is" : "are"} available.`;
}

export function assertAvailableQuantity(
  variant: Pick<ProductVariant, "trackStock" | "stockQuantity" | "label">,
  quantity: number,
  productName: string,
) {
  if (!variant.trackStock) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > CART_QUANTITY_CAP) {
      throw new Error(`Quantity cannot exceed ${CART_QUANTITY_CAP}.`);
    }
    return;
  }
  if (variant.stockQuantity < 1) {
    throw new Error(stockLimitMessage(productName, variant.label, 0));
  }
  if (quantity > variant.stockQuantity) {
    throw new Error(stockLimitMessage(productName, variant.label, variant.stockQuantity));
  }
  if (quantity > CART_QUANTITY_CAP) {
    throw new Error(`Quantity cannot exceed ${CART_QUANTITY_CAP}.`);
  }
}

export const STOCK_BADGE_LABEL: Record<StockState, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  not_tracked: "Not tracked",
};
