import { describe, expect, it } from "vitest";
import { normalizeOrderNumber, orderEmailMatches } from "@/lib/orders/lookup";

describe("order lookup", () => {
  it("normalizes order numbers", () => {
    expect(normalizeOrderNumber(" elf-ab12 ")).toBe("ELF-AB12");
  });

  it("matches checkout emails without leaking case differences", () => {
    expect(orderEmailMatches("Ama@Example.com", "ama@example.com")).toBe(true);
    expect(orderEmailMatches("ama@example.com", "other@example.com")).toBe(false);
  });
});
