import { describe, expect, it } from "vitest";
import {
  assertFulfillmentTransition,
  canTransitionFulfillment,
  isPaidRevenue,
} from "@/lib/orders/transitions";

describe("fulfillment transitions", () => {
  it("allows unfulfilled to processing", () => {
    expect(canTransitionFulfillment("unfulfilled", "processing")).toBe(true);
  });

  it("rejects delivered to unfulfilled", () => {
    expect(() => assertFulfillmentTransition("delivered", "unfulfilled")).toThrow();
  });

  it("treats only paid as revenue", () => {
    expect(isPaidRevenue("paid")).toBe(true);
    expect(isPaidRevenue("pending")).toBe(false);
    expect(isPaidRevenue("refunded")).toBe(false);
  });
});
