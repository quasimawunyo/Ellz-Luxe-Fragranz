import { describe, expect, it } from "vitest";
import { paystackChargeMatchesOrder } from "@/lib/payments/charge-match";

const order = { totalMinor: 28000, currencyCode: "GHS" };

describe("paystackChargeMatchesOrder", () => {
  it("rejects missing amount or currency", () => {
    expect(paystackChargeMatchesOrder({}, order)).toBe(false);
    expect(paystackChargeMatchesOrder({ amount: 28000 }, order)).toBe(false);
    expect(paystackChargeMatchesOrder(undefined, order)).toBe(false);
  });

  it("rejects a short payment", () => {
    expect(paystackChargeMatchesOrder({ amount: 100, currency: "GHS" }, order)).toBe(false);
  });

  it("accepts an exact GHS match", () => {
    expect(paystackChargeMatchesOrder({ amount: 28000, currency: "GHS" }, order)).toBe(true);
  });
});
