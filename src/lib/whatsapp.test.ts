import { describe, expect, it } from "vitest";
import {
  annexOrderNotice,
  annexOrderWhatsAppHref,
  customerOrderWhatsAppMessage,
  formatGhanaPhone,
  whatsappHref,
} from "@/lib/whatsapp";

describe("whatsappHref", () => {
  it("builds a wa.me link from a Ghana number", () => {
    expect(whatsappHref("+233 55 705 1266")).toBe("https://wa.me/233557051266");
  });

  it("converts a local Ghana 0-number to an international wa.me link", () => {
    expect(whatsappHref("0593634512")).toBe("https://wa.me/233593634512");
  });

  it("skips placeholder numbers", () => {
    expect(whatsappHref("+233 00 000 0000")).toBeNull();
  });

  it("builds an annex notice with the order total in cedis", () => {
    const order = {
      orderNumber: "ELF-TEST",
      fullName: "Ama Mensah",
      phone: "0241234567",
      email: "ama@example.com",
      region: "Greater Accra",
      locality: "Labone",
      addressLine: "12 Osu Road",
      deliveryMethod: "Greater Accra delivery",
      paymentStatus: "pending",
      notes: null,
      currencyCode: "GHS",
      totalMinor: 73000,
      items: [{ productName: "Citrus Veil", variantLabel: "50 ml", quantity: 1 }],
    };
    expect(annexOrderNotice(order)).toContain("ELF-TEST");
    expect(annexOrderNotice(order)).toContain("GH₵730.00");
    expect(annexOrderWhatsAppHref("0593634512", order)).toMatch(/^https:\/\/wa\.me\/233593634512\?text=/);
  });

  it("formats a Ghana WhatsApp number for display", () => {
    expect(formatGhanaPhone("0241234567")).toBe("024 123 4567");
    expect(customerOrderWhatsAppMessage({ orderNumber: "ELF-1", fullName: "Ama Mensah" })).toContain("ELF-1");
  });
});
