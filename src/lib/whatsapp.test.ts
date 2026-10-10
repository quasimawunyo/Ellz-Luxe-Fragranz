import { describe, expect, it } from "vitest";
import { whatsappHref } from "@/lib/whatsapp";

describe("whatsappHref", () => {
  it("builds a wa.me link from a Ghana number", () => {
    expect(whatsappHref("+233 55 705 1266")).toBe("https://wa.me/233557051266");
  });

  it("skips placeholder numbers", () => {
    expect(whatsappHref("+233 00 000 0000")).toBeNull();
  });
});
