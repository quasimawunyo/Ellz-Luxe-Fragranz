import { describe, expect, it } from "vitest";
import { productImageExtension, productImageKey, productImageUrl } from "@/lib/storage/images";

describe("product image keys", () => {
  it("keeps jpeg, png, and webp", () => {
    expect(productImageExtension("image/jpeg")).toBe("jpg");
    expect(productImageExtension("image/png")).toBe("png");
    expect(productImageExtension("image/webp")).toBe("webp");
    expect(productImageExtension("image/gif")).toBeNull();
  });

  it("builds a stable public url", () => {
    expect(productImageKey("yara", "image/jpeg", "photo-1")).toBe("products/yara/photo-1.jpg");
    expect(productImageUrl("https://images.ellzluxefragranz.com/", "products/yara/photo-1.jpg")).toBe(
      "https://images.ellzluxefragranz.com/products/yara/photo-1.jpg",
    );
  });
});
