import { minorFromCedisInput } from "@/lib/money";

export type ParsedSize = {
  id: string;
  sizeMl: number;
  priceMinor: number;
  compareAtMinor: number | null;
  sku: string;
  label: string;
  visible: boolean;
  stockQuantity: number;
  trackStock: boolean;
  costMinor: number | null;
  lowStockThreshold: number | null;
};

type RawSize = {
  id?: string;
  sizeMl?: string;
  priceCedis?: string;
  compareAtCedis?: string;
  sku?: string;
  visible?: boolean;
  stockQuantity?: string;
  trackStock?: boolean;
  costCedis?: string;
  lowStockThreshold?: string;
};

export function skuForBottle(name: string, sizeMl: number) {
  const letters = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "BTL";
  return `ELF-${letters}-${sizeMl}`;
}

export function parseSizeRows(raw: string, bottleName: string, confirmLowPrice: boolean): { error: string } | { sizes: ParsedSize[] } {
  let rows: RawSize[];
  try {
    rows = JSON.parse(raw) as RawSize[];
  } catch {
    return { error: "Enter the size in ml." };
  }
  if (!Array.isArray(rows) || rows.length === 0) return { error: "Enter the size in ml." };
  const sizes: ParsedSize[] = [];
  const seen = new Set<number>();
  for (const row of rows) {
    const sizeText = String(row.sizeMl ?? "").trim();
    const priceText = String(row.priceCedis ?? "").trim();
    if (!sizeText && !priceText && !String(row.sku ?? "").trim()) continue;
    const sizeMl = Number(sizeText);
    if (!sizeText || !Number.isInteger(sizeMl) || sizeMl < 1 || sizeMl > 2000) return { error: "Enter the size in ml." };
    if (seen.has(sizeMl)) return { error: `This bottle already has a ${sizeMl} ml size.` };
    seen.add(sizeMl);
    const priceMinor = minorFromCedisInput(priceText);
    if (priceMinor == null || priceMinor <= 0) return { error: "Enter a price above GH₵0." };
    if (priceMinor < 5000 && !confirmLowPrice) return { error: "A price is under GH₵50. Tick the confirmation to save it." };
    const compareText = String(row.compareAtCedis ?? "").trim();
    const compareAtMinor = compareText ? minorFromCedisInput(compareText) : null;
    if (compareText && compareAtMinor == null) return { error: "Enter the compare-at price in Ghana cedis, or leave it empty." };
    if (compareAtMinor != null && compareAtMinor <= priceMinor) return { error: "The compare-at price must be higher than the price." };
    const costText = String(row.costCedis ?? "").trim();
    const costMinor = costText ? minorFromCedisInput(costText) : null;
    if (costText && costMinor == null) return { error: "Enter the cost in Ghana cedis, or leave it empty." };
    const quantity = Number(String(row.stockQuantity ?? "0").trim() || "0");
    if (!Number.isInteger(quantity) || quantity < 0) return { error: "Enter a stock quantity of zero or more." };
    const thresholdText = String(row.lowStockThreshold ?? "").trim();
    const lowStockThreshold = thresholdText === "" ? null : Number(thresholdText);
    if (lowStockThreshold != null && (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0)) {
      return { error: "Low-stock threshold must be a whole number, or left empty for the store default of 3." };
    }
    const sku = String(row.sku ?? "").trim() || skuForBottle(bottleName, sizeMl);
    sizes.push({
      id: String(row.id ?? "").trim(),
      sizeMl,
      priceMinor,
      compareAtMinor,
      sku,
      label: `${sizeMl} ml`,
      visible: row.visible !== false,
      stockQuantity: quantity,
      trackStock: Boolean(row.trackStock),
      costMinor,
      lowStockThreshold,
    });
  }
  if (!sizes.length) return { error: "Enter the size in ml." };
  return { sizes };
}
