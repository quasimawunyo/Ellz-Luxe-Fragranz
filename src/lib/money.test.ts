import { describe, expect, it } from "vitest";
import { addMinor, cartTotals, formatMoney, lineTotalMinor, orderGrandTotal } from "@/lib/money";

describe("money", () => {
  it("adds integer minor units", () => {
    expect(addMinor(100, 250, 3)).toBe(353);
  });

  it("rejects floating amounts", () => {
    expect(() => addMinor(1.5)).toThrow();
  });

  it("computes line and cart totals", () => {
    expect(lineTotalMinor(42000, 2)).toBe(84000);
    expect(cartTotals([{ unitMinor: 42000, quantity: 2 }, { unitMinor: 3000, quantity: 1 }])).toEqual({
      subtotalMinor: 87000,
    });
  });

  it("adds shipping without float math", () => {
    expect(orderGrandTotal(87000, 3000)).toBe(90000);
  });

  it("formats GHS", () => {
    expect(formatMoney(42000, "GHS")).toBe("GH₵420.00");
  });
});
