import "server-only";

import { launchAttention, lowStockSizes } from "@/lib/admin/launch-checks-format";
import { listContactMessages } from "@/lib/admin/inbox";
import { getAllProductsForAdmin, getStoreSettings } from "@/lib/catalog/queries";
import { looksLikeTest } from "@/lib/orders/desk";
import { listOrders } from "@/lib/orders/store";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export async function loadLaunchAttention(now = new Date()) {
  const [products, orders, settings, messages] = await Promise.all([
    getAllProductsForAdmin(),
    listOrders(),
    getStoreSettings(),
    listContactMessages(false, 200),
  ]);
  const shop = { email: settings.contactEmail, phone: settings.contactPhone };
  const cutoff = now.getTime() - TWO_DAYS_MS;
  const lines = launchAttention({
    underpriced: products.flatMap((product) =>
      product.variants
        .filter((variant) => variant.priceMinor < 5000)
        .map((variant) => ({ productName: product.name, label: variant.label })),
    ),
    untracked: products.reduce((count, product) => count + product.variants.filter((variant) => !variant.trackStock).length, 0),
    testLike: orders.filter((order) => looksLikeTest(order, shop)).length,
    unanswered: messages.filter((message) => !message.isSpam && !message.answeredAt && new Date(message.createdAt).getTime() < cutoff).length,
  });
  return { lines, lowStock: lowStockSizes(products) };
}
