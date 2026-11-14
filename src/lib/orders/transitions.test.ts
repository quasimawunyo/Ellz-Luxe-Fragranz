import { describe, expect, it } from "vitest";
import { assertFulfillmentTransition, canTransitionFulfillment, isPaidRevenue, nextFulfillmentStatus } from "@/lib/orders/transitions";

describe("fulfilment transitions", () => {
  it("allows a new order to be packed", () => {
    expect(canTransitionFulfillment("new", "packed")).toBe(true);
    expect(nextFulfillmentStatus("new", "Pickup at Ells Luxe Annex")).toBe("packed");
  });

  it("rejects a collected order going back to new", () => {
    expect(() => assertFulfillmentTransition("collected", "new")).toThrow();
  });

  it("treats only paid orders as revenue", () => {
    expect(isPaidRevenue("paid")).toBe(true);
    expect(isPaidRevenue("pending")).toBe(false);
    expect(isPaidRevenue("refunded")).toBe(false);
  });
});
