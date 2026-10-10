import { describe, expect, it } from "vitest";
import { filterProducts } from "@/lib/catalog/helpers";
import { DEMO_PRODUCTS } from "@/lib/catalog/seed";

describe("catalog filters", () => {
  it("filters by search text against real product data", () => {
    const result = filterProducts(DEMO_PRODUCTS, { q: "oud", sort: "featured", page: 1 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => JSON.stringify(product).toLowerCase().includes("oud"))).toBe(true);
  });

  it("filters by house brand slug", () => {
    const result = filterProducts(DEMO_PRODUCTS, { brand: "lattafa", sort: "featured", page: 1 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.brand === "Lattafa")).toBe(true);
  });

  it("sorts by price ascending", () => {
    const result = filterProducts(DEMO_PRODUCTS, { sort: "price-asc", page: 1 });
    const prices = result.map((product) => Math.min(...product.variants.map((v) => v.priceMinor)));
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
});
