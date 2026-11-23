import { describe, expect, it } from "vitest";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { DEMO_COLLECTIONS, DEMO_PRODUCTS } from "@/lib/catalog/seed";
import { PAGE_DESCRIPTIONS, brandMetaDescription, collectionMetaDescription, productMetaDescription } from "@/lib/seo-copy";

const descriptions = [
  ...Object.values(PAGE_DESCRIPTIONS),
  ...DEMO_COLLECTIONS.filter((collection) => collection.slug !== "gift-and-discovery-sets").map((collection) =>
    collectionMetaDescription(collection.description),
  ),
  ...HOUSE_BRANDS.map((brand) => brandMetaDescription(brand.name)),
  ...DEMO_PRODUCTS.filter((product) => product.status === "published").map((product) => productMetaDescription(product)),
];

describe("public meta descriptions", () => {
  it("keeps every description between 70 and 155 characters, with no duplicates or card payments", () => {
    const seen = new Set<string>();
    for (const description of descriptions) {
      expect(description.length, description).toBeGreaterThanOrEqual(70);
      expect(description.length, description).toBeLessThanOrEqual(155);
      expect(description.toLowerCase(), description).not.toContain("card");
      expect(seen.has(description), description).toBe(false);
      seen.add(description);
    }
  });
});
