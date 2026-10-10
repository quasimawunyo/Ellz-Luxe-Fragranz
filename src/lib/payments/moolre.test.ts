import { describe, expect, it } from "vitest";
import { verifyMoolreCallbackSecret } from "@/lib/payments/signature";
import { cedisFromMinor, minorFromCedis, moolreAmountMatches, moolrePaymentSucceeded } from "@/lib/payments/moolre-money";

describe("moolre money helpers", () => {
  it("converts pesewas to a GHS decimal string", () => {
    expect(cedisFromMinor(1521)).toBe("15.21");
    expect(cedisFromMinor(100)).toBe("1.00");
  });

  it("parses Moolre decimal amounts back to pesewas", () => {
    expect(minorFromCedis("15.21")).toBe(1521);
    expect(minorFromCedis("1")).toBe(100);
  });

  it("rejects an amount that does not match the order", () => {
    expect(moolreAmountMatches("15.21", 1521)).toBe(true);
    expect(moolreAmountMatches("15.00", 1521)).toBe(false);
  });

  it("treats txstatus 1 as paid", () => {
    expect(moolrePaymentSucceeded({ txstatus: 1 })).toBe(true);
    expect(moolrePaymentSucceeded({ txstatus: 0 })).toBe(false);
    expect(moolrePaymentSucceeded({ txstatus: 2 })).toBe(false);
  });
});

describe("moolre callback secret", () => {
  it("accepts the exact secret", () => {
    expect(verifyMoolreCallbackSecret("wallet-secret", "wallet-secret")).toBe(true);
  });

  it("rejects a missing or different secret", () => {
    expect(verifyMoolreCallbackSecret(undefined, "wallet-secret")).toBe(false);
    expect(verifyMoolreCallbackSecret("other", "wallet-secret")).toBe(false);
  });
});
