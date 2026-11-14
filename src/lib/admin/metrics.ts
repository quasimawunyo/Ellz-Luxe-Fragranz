import { amountPaidMinor } from "@/lib/orders/desk";
import { isPaidRevenue } from "@/lib/orders/transitions";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { StoreOrder } from "@/lib/orders/types";
import { stockState } from "@/lib/stock";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ghanaDayKey(iso: string) {
  const formatter = new Intl.DateTimeFormat("en-GH", {
    timeZone: "Africa/Accra",
    month: "short",
    day: "numeric",
  });
  return formatter.format(new Date(iso));
}

export function buildDashboardMetrics(
  orders: StoreOrder[],
  products: CatalogProduct[],
  extras?: { messages?: number; subscribers?: number },
  now = new Date(),
) {
  const countable = orders.filter((order) => !order.isTest);
  const paid = countable.filter((order) => isPaidRevenue(order.paymentStatus));
  const pending = countable.filter((order) => order.paymentStatus === "pending");
  const paidRevenue = paid.reduce((sum, order) => {
    const received = amountPaidMinor(order.payments);
    return sum + (received > 0 ? received : order.totalMinor);
  }, 0);
  const pendingValue = pending.reduce((sum, order) => sum + order.totalMinor, 0);
  const weekStart = now.getTime() - 7 * DAY_MS;
  const paidThisWeek = paid.filter((order) => new Date(order.createdAt).getTime() >= weekStart);
  const weekRevenue = paidThisWeek.reduce((sum, order) => {
    const received = amountPaidMinor(order.payments);
    return sum + (received > 0 ? received : order.totalMinor);
  }, 0);

  const sales = new Map<string, number>();
  for (const order of paid) {
    for (const item of order.items) {
      sales.set(item.productName, (sales.get(item.productName) ?? 0) + item.quantity);
    }
  }
  const bestSellers = [...sales.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const toPack = countable.filter(
    (order) =>
      isPaidRevenue(order.paymentStatus) &&
      (order.fulfillmentStatus === "new" || order.fulfillmentStatus === "packed"),
  );
  const awaitingReview = countable.filter((order) => order.awaitingReview);

  const variantRows = products.flatMap((product) =>
    product.variants.map((variant) => ({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      label: variant.label,
      quantity: variant.stockQuantity,
      state: stockState(variant),
    })),
  );
  const tracked = variantRows.filter((row) => row.state !== "not_tracked");
  const inStock = tracked.filter((row) => row.state === "in_stock");
  const lowStock = tracked.filter((row) => row.state === "low_stock");
  const outOfStock = tracked.filter((row) => row.state === "out_of_stock");
  const needsAttention = countable.filter((order) => order.needsAttention);
  const drafts = products.filter((product) => product.status === "draft");
  const demonstration = products.filter((product) => product.isDemonstration);
  const live = products.filter((product) => !product.isDemonstration && product.status === "published");

  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    dayKeys.push(ghanaDayKey(new Date(now.getTime() - i * DAY_MS).toISOString()));
  }
  const byDay = new Map(dayKeys.map((key) => [key, 0]));
  for (const order of paidThisWeek) {
    const key = ghanaDayKey(order.createdAt);
    if (byDay.has(key)) {
      const received = amountPaidMinor(order.payments);
      byDay.set(key, (byDay.get(key) ?? 0) + (received > 0 ? received : order.totalMinor));
    }
  }
  const weekSeries = dayKeys.map((label) => ({ label, amountMinor: byDay.get(label) ?? 0 }));
  const weekPeak = Math.max(1, ...weekSeries.map((point) => point.amountMinor));

  return {
    orderCount: orders.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    paidRevenue,
    pendingValue,
    weekRevenue,
    weekSeries,
    weekPeak,
    bestSellers,
    toPack,
    awaitingReview,
    needsAttention,
    variantCount: variantRows.length,
    inStockCount: inStock.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStock,
    outOfStock,
    drafts,
    demonstration,
    live,
    publishedCount: products.filter((product) => product.status === "published").length,
    messages: extras?.messages ?? 0,
    subscribers: extras?.subscribers ?? 0,
  };
}
