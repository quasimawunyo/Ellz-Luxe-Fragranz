import { describe, expect, it } from "vitest";
import { launchAttention, lowStockSizes } from "@/lib/admin/launch-checks-format";

describe("launch attention", () => {
  it("lists only the checks that still need a person", () => {
    expect(
      launchAttention({
        underpriced: [{ productName: "Club de Nuit Intense Man", label: "50 ml" }],
        untracked: 2,
        testLike: 1,
        unanswered: 0,
      }),
    ).toEqual([
      {
        text: "1 size is priced under GH₵50",
        href: "/admin/products",
        details: ["Club de Nuit Intense Man, 50 ml"],
      },
      {
        text: "2 sizes are not tracked, so they can never sell out",
        href: "/admin/products/opening",
        details: [],
      },
      {
        text: "1 order looks like a test",
        href: "/admin/orders?view=all&tests=suggest",
        details: [],
      },
    ]);
  });

  it("includes a tracked size at zero", () => {
    expect(
      lowStockSizes([
        {
          name: "Yara",
          variants: [
            { id: "yara-50", label: "50 ml", trackStock: true, stockQuantity: 0, lowStockThreshold: null },
            { id: "yara-100", label: "100 ml", trackStock: false, stockQuantity: 0, lowStockThreshold: null },
          ],
        },
      ]),
    ).toEqual([{ variantId: "yara-50", productName: "Yara", label: "50 ml", quantity: 0 }]);
  });
});
