import { describe, expect, it } from "vitest";
import { checkoutSchema, newsletterSchema, shopFilterSchema } from "@/lib/validations";

describe("validation", () => {
  it("accepts a Ghana checkout payload", () => {
    const parsed = checkoutSchema.safeParse({
      fullName: "Ama Mensah",
      email: "ama@example.com",
      phone: "0241234567",
      region: "Greater Accra",
      locality: "Labone",
      addressLine: "12 Osu Road",
      deliveryMethodId: "accra",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid newsletter emails", () => {
    expect(newsletterSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("defaults shop sort and page", () => {
    const parsed = shopFilterSchema.parse({});
    expect(parsed.sort).toBe("featured");
    expect(parsed.page).toBe(1);
  });
});
