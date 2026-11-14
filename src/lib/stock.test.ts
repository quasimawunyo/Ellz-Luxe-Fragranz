import { describe, expect, it } from "vitest";
import {
  assertAvailableQuantity,
  isSoldOut,
  stockState,
  storefrontStockLabel,
} from "@/lib/stock";

const base = { label: "50 ml", lowStockThreshold: null as number | null };

describe("stock status", () => {
  it("treats an untracked bottle as sellable", () => {
    const variant = { ...base, trackStock: false, stockQuantity: 0 };
    expect(stockState(variant)).toBe("not_tracked");
    expect(isSoldOut(variant)).toBe(false);
    expect(storefrontStockLabel(variant)).toBe("In stock");
    expect(() => assertAvailableQuantity(variant, 1, "Yara")).not.toThrow();
  });

  it("marks tracked quantity zero as out of stock", () => {
    const variant = { ...base, trackStock: true, stockQuantity: 0 };
    expect(stockState(variant)).toBe("out_of_stock");
    expect(isSoldOut(variant)).toBe(true);
    expect(() => assertAvailableQuantity(variant, 1, "Yara")).toThrow(/Yara \(50 ml\) is out of stock/);
  });

  it("uses the store default of 3 when the threshold is empty", () => {
    expect(stockState({ ...base, trackStock: true, stockQuantity: 3 })).toBe("low_stock");
    expect(stockState({ ...base, trackStock: true, stockQuantity: 4 })).toBe("in_stock");
  });

  it("uses a custom low-stock threshold", () => {
    expect(stockState({ ...base, trackStock: true, stockQuantity: 2, lowStockThreshold: 1 })).toBe("in_stock");
    expect(stockState({ ...base, trackStock: true, stockQuantity: 1, lowStockThreshold: 1 })).toBe("low_stock");
  });

  it("says only N left at five or below", () => {
    expect(storefrontStockLabel({ trackStock: true, stockQuantity: 5 })).toBe("Only 5 left");
    expect(storefrontStockLabel({ trackStock: true, stockQuantity: 6 })).toBe("In stock");
  });

  it("refuses a quantity above what is available", () => {
    const variant = { ...base, trackStock: true, stockQuantity: 2 };
    expect(() => assertAvailableQuantity(variant, 3, "Island Sun")).toThrow(
      "Only 2 of Island Sun (50 ml) are available.",
    );
  });
});
