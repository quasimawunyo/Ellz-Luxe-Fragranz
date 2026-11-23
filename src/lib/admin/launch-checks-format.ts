export type AttentionLine = {
  text: string;
  href: string;
  details: string[];
};

export type LowStockSize = {
  variantId: string;
  productName: string;
  label: string;
  quantity: number;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function launchAttention(input: {
  underpriced: { productName: string; label: string }[];
  untracked: number;
  testLike: number;
  unanswered: number;
}): AttentionLine[] {
  const lines: AttentionLine[] = [];
  if (input.underpriced.length) {
    lines.push({
      text: `${countLabel(input.underpriced.length, "size is", "sizes are")} priced under GH₵50`,
      href: "/admin/products",
      details: input.underpriced.map((size) => `${size.productName}, ${size.label}`),
    });
  }
  if (input.untracked) {
    lines.push({
      text: `${countLabel(input.untracked, "size is", "sizes are")} not tracked, so ${input.untracked === 1 ? "it can" : "they can"} never sell out`,
      href: "/admin/products/opening",
      details: [],
    });
  }
  if (input.testLike) {
    lines.push({
      text: `${countLabel(input.testLike, "order looks", "orders look")} like ${input.testLike === 1 ? "a test" : "tests"}`,
      href: "/admin/orders?view=all&tests=suggest",
      details: [],
    });
  }
  if (input.unanswered) {
    lines.push({
      text: `${countLabel(input.unanswered, "message has", "messages have")} not been answered`,
      href: "/admin/inbox",
      details: [],
    });
  }
  return lines;
}

export function lowStockSizes(
  products: { name: string; variants: { id: string; label: string; trackStock: boolean; stockQuantity: number; lowStockThreshold: number | null }[] }[],
): LowStockSize[] {
  return products
    .flatMap((product) =>
      product.variants
        .filter((variant) => variant.trackStock && variant.stockQuantity <= (variant.lowStockThreshold ?? 3))
        .map((variant) => ({
          variantId: variant.id,
          productName: product.name,
          label: variant.label,
          quantity: variant.stockQuantity,
        })),
    )
    .sort((a, b) => a.quantity - b.quantity || a.productName.localeCompare(b.productName));
}
