import { describe, expect, it } from "vitest";
import { discountedVariantOffers, filterProducts, homepageNewArrivals, isDiscounted, isNewProduct, publicDescription } from "@/lib/catalog/helpers";
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

  it("treats recent products as new", () => {
    expect(isNewProduct({ ...DEMO_PRODUCTS[0], createdAt: new Date().toISOString() })).toBe(true);
    expect(isNewProduct({ ...DEMO_PRODUCTS[0], createdAt: "2020-01-01T00:00:00.000Z" })).toBe(false);
    expect(
      isNewProduct({ ...DEMO_PRODUCTS[0], createdAt: "2020-01-01T00:00:00.000Z", newArrival: true }),
    ).toBe(true);
  });

  it("filters shop to new arrivals", () => {
    const result = filterProducts(DEMO_PRODUCTS, { arrival: "1", sort: "featured", page: 1 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.newArrival || isNewProduct(product))).toBe(true);
  });

  it("hides the photography note and keeps featured bottles out of the new-arrivals rail", () => {
    expect(publicDescription("Lattafa Yara eau de parfum. Photographed from the house bottle.")).toBe(
      "Lattafa Yara eau de parfum.",
    );
    const featuredNew = { ...DEMO_PRODUCTS[0], featured: true, newArrival: true };
    const quietNew = { ...DEMO_PRODUCTS[1], featured: false, newArrival: true };
    const arrivals = homepageNewArrivals([featuredNew, quietNew]);
    expect(arrivals.map((product) => product.id)).toEqual([quietNew.id]);
  });

  it("treats a higher compare-at price as a discount", () => {
    const product = DEMO_PRODUCTS[0];
    expect(isDiscounted(product)).toBe(false);
    expect(discountedVariantOffers(product)).toEqual([]);
    const discounted = {
      ...product,
      variants: [
        { ...product.variants[0], priceMinor: 40000, compareAtMinor: 48000 },
        { ...product.variants[0], id: "full", priceMinor: 68000, compareAtMinor: null },
      ],
    };
    expect(isDiscounted(discounted)).toBe(true);
    expect(discountedVariantOffers(discounted).map((variant) => variant.priceMinor)).toEqual([40000]);
  });

  it("sorts by price ascending", () => {
    const result = filterProducts(DEMO_PRODUCTS, { sort: "price-asc", page: 1 });
    const prices = result.map((product) => Math.min(...product.variants.map((v) => v.priceMinor)));
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
});
