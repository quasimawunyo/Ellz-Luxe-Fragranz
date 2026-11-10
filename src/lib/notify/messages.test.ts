import { describe, expect, it } from "vitest";
import { customerOrderEmailText } from "@/lib/notify/messages";

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
  shippingMinor: 0,
  items: [{ productName: "Citrus Veil", variantLabel: "50 ml", quantity: 1 }],
};

describe("customerOrderEmailText", () => {
  it("hides size-only labels and does not mark the order paid", () => {
    const text = customerOrderEmailText(order, {
      siteUrl: "https://ellz-luxe-fragranz.vercel.app",
      contactPhone: "0593634512",
    });
    expect(text).toContain("ELF-TEST");
    expect(text).toContain("Citrus Veil × 1");
    expect(text).not.toContain("50 ml");
    expect(text).toContain("not marked paid");
    expect(text).toContain("/track");
    expect(text.toLowerCase()).not.toContain("moolre");
    expect(text.toLowerCase()).not.toContain("paystack");
  });
});
