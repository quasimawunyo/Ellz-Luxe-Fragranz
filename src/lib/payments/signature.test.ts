import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "@/lib/payments/signature";

describe("paystack signatures", () => {
  it("accepts a valid hmac", () => {
    const body = '{"event":"charge.success"}';
    const secret = "test-secret";
    const signature = createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyPaystackSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a missing or wrong signature", () => {
    expect(verifyPaystackSignature("{}", null, "secret")).toBe(false);
    expect(verifyPaystackSignature("{}", "deadbeef", "secret")).toBe(false);
  });
});
