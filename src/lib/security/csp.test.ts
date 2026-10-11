import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/lib/security/csp";

describe("content security policy", () => {
  it("does not allow un-nonced inline scripts", () => {
    const policy = contentSecurityPolicy("test-nonce");
    const scriptSrc = policy.split("; ").find((part) => part.startsWith("script-src")) ?? "";
    expect(scriptSrc).toContain("'nonce-test-nonce'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});
