import { describe, expect, it } from "vitest";
import { classifyTrackQuery, normalizeOrderNumber, orderEmailMatches, phonesMatch } from "@/lib/orders/lookup";

describe("order lookup", () => {
  it("normalizes order numbers", () => {
    expect(normalizeOrderNumber(" elf-ab12 ")).toBe("ELF-AB12");
  });

  it("treats an ELF number and a Ghana phone as different lookups", () => {
    expect(classifyTrackQuery(" elf-b976 ")).toBe("order");
    expect(classifyTrackQuery("020 123 4567")).toBe("phone");
    expect(classifyTrackQuery("12")).toBe("invalid");
  });

  it("matches a local phone with the same number saved in international form", () => {
    expect(phonesMatch("+233 20 123 4567", "0201234567")).toBe(true);
    expect(phonesMatch("0240000000", "0201234567")).toBe(false);
  });

  it("matches checkout emails without leaking case differences", () => {
    expect(orderEmailMatches("Ama@Example.com", "ama@example.com")).toBe(true);
    expect(orderEmailMatches("ama@example.com", "other@example.com")).toBe(false);
  });
});
