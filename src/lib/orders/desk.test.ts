import { describe, expect, it } from "vitest";
import { amountPaidMinor, balanceDueMinor, filterOrders } from "@/lib/orders/desk";
import { nextFulfillmentStatus } from "@/lib/orders/transitions";
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
    deliveryMethod: "Greater Accra delivery",
    notes: null,
    currencyCode: "GHS",
    subtotalMinor: 48000,
    shippingMinor: 0,
    totalMinor: 48000,
    orderStatus: "open",
    paymentStatus: "paid",
    fulfillmentStatus: "new",
    trackingNumber: null,
    needsAttention: false,
    attentionNote: null,
    stockApplied: false,
    isTest: false,
    awaitingReview: false,
    createdAt: "2026-11-14T10:00:00.000Z",
    items: [],
    payments: [],
    events: [],
    paystackReference: null,
    ...partial,
  };
}

describe("order desk", () => {
  it("moves a delivery order through packing and delivery", () => {
    expect(nextFulfillmentStatus("new", "Greater Accra delivery")).toBe("packed");
    expect(nextFulfillmentStatus("packed", "Greater Accra delivery")).toBe("out_for_delivery");
    expect(nextFulfillmentStatus("out_for_delivery", "Greater Accra delivery")).toBe("delivered");
  });

  it("moves a pickup order to ready and collected", () => {
    expect(nextFulfillmentStatus("packed", "Pickup at Ells Luxe Annex")).toBe("ready_for_pickup");
    expect(nextFulfillmentStatus("ready_for_pickup", "Pickup at Ells Luxe Annex")).toBe("collected");
  });

  it("shows the balance after a delivery fee is added", () => {
    const payments = [
      {
        id: "p1",
        provider: "moolre",
        method: "moolre",
        reference: "elf_1",
        amountMinor: 48000,
        status: "paid" as const,
        note: null,
        linkUrl: null,
        createdAt: "2026-11-14T10:00:00.000Z",
      },
    ];
    expect(amountPaidMinor(payments)).toBe(48000);
    expect(balanceDueMinor(55000, payments)).toBe(7000);
  });

  it("hides test orders and finished orders from the default queue", () => {
    const rows = filterOrders(
      [
        order({ id: "open", orderNumber: "ELF-OPEN" }),
        order({ id: "done", orderNumber: "ELF-DONE", fulfillmentStatus: "delivered" }),
        order({ id: "test", orderNumber: "ELF-TEST", isTest: true }),
        order({ id: "wait", orderNumber: "ELF-WAIT", paymentStatus: "pending" }),
      ],
      {},
    );
    expect(rows.map((row) => row.orderNumber)).toEqual(["ELF-OPEN"]);
  });
});
