import { describe, expect, it } from "vitest";
import { buildDashboardMetrics } from "@/lib/admin/metrics";
import { DEMO_PRODUCTS } from "@/lib/catalog/seed";
import type { StoreOrder } from "@/lib/orders/types";

function order(partial: Partial<StoreOrder>): StoreOrder {
  return {
    id: "1",
    orderNumber: "ELF-1",
    userId: null,
    email: "ama@example.com",
    fullName: "Ama Mensah",
    phone: "0241234567",
    region: "Greater Accra",
    locality: "Labone",
    addressLine: "12 Osu Road",
    deliveryMethod: "Pickup",
    notes: null,
    currencyCode: "GHS",
    subtotalMinor: 42000,
    shippingMinor: 0,
    totalMinor: 42000,
    orderStatus: "open",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    trackingNumber: null,
    createdAt: new Date().toISOString(),
    items: [{ productName: "Citrus Veil", sku: "CV", variantLabel: "50 ml", quantity: 1, unitPriceMinor: 42000, productId: null, variantId: null }],
    paystackReference: "elf_1",
    ...partial,
  };
}

describe("admin metrics", () => {
  it("does not count pending orders as paid revenue", () => {
    const metrics = buildDashboardMetrics(
      [order({ paymentStatus: "pending", totalMinor: 50000 }), order({ paymentStatus: "paid", totalMinor: 28000, orderNumber: "ELF-2" })],
      DEMO_PRODUCTS.slice(0, 2),
    );
    expect(metrics.paidRevenue).toBe(28000);
    expect(metrics.pendingValue).toBe(50000);
    expect(metrics.paidCount).toBe(1);
  });

  it("flags paid orders that still need packing", () => {
    const metrics = buildDashboardMetrics(
      [
        order({ paymentStatus: "paid", fulfillmentStatus: "unfulfilled" }),
        order({ id: "2", orderNumber: "ELF-2", paymentStatus: "paid", fulfillmentStatus: "delivered" }),
      ],
      DEMO_PRODUCTS.slice(0, 1),
    );
    expect(metrics.toPack).toHaveLength(1);
  });
});
