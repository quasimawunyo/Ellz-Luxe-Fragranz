import { describe, expect, it } from "vitest";
import {
  canFulfill,
  decrementStock,
  InsufficientStockError,
  reserveStockMap,
} from "@/lib/inventory";

describe("inventory", () => {
  it("prevents overselling", () => {
    expect(canFulfill(2, 3)).toBe(false);
    expect(() => decrementStock(2, 3)).toThrow(InsufficientStockError);
  });

  it("decrements when stock is sufficient", () => {
    expect(decrementStock(5, 2)).toBe(3);
  });

  it("applies sequential reservations without oversell", () => {
    const stock = new Map([["var-a", 3]]);
    const afterFirst = reserveStockMap(stock, [{ variantId: "var-a", quantity: 2 }]);
    expect(afterFirst.get("var-a")).toBe(1);
    expect(() =>
      reserveStockMap(afterFirst, [{ variantId: "var-a", quantity: 2 }]),
    ).toThrow(InsufficientStockError);
  });
});
