import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/security/paths";

describe("safeInternalPath", () => {
  it("keeps relative shop paths", () => {
    expect(safeInternalPath("/account")).toBe("/account");
    expect(safeInternalPath("/admin/orders")).toBe("/admin/orders");
    expect(safeInternalPath("/checkout/confirmation?order=abc")).toBe(
      "/checkout/confirmation?order=abc",
    );
  });

  it("rejects open redirects", () => {
    expect(safeInternalPath("https://evil.example")).toBe("/account");
    expect(safeInternalPath("//evil.example")).toBe("/account");
    expect(safeInternalPath("///evil.example")).toBe("/account");
    expect(safeInternalPath("/\\evil.example")).toBe("/account");
    expect(safeInternalPath("account")).toBe("/account");
  });
});
