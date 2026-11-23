import { describe, expect, it } from "vitest";
import { validationState } from "@/lib/forms/errors";
import { addToCartSchema, checkoutSchema, contactSchema, newsletterSchema, shopFilterSchema, signInSchema } from "@/lib/validations";

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
    const parsed = newsletterSchema.safeParse({ email: "not-an-email" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(validationState(parsed.error).fields?.email).toBe("Enter a valid email address.");
  });

  it("uses plain sentences for a quantity over the limit and a short name", () => {
    const quantity = addToCartSchema.safeParse({ variantId: "var-oud-50", quantity: 9 });
    expect(quantity.success).toBe(false);
    if (!quantity.success) {
      expect(validationState(quantity.error)).toMatchObject({
        focus: "quantity",
        fields: { quantity: "You can order up to 6 of this item." },
      });
    }
    const low = addToCartSchema.safeParse({ variantId: "var-oud-50", quantity: 0 });
    expect(low.success).toBe(false);
    if (!low.success) expect(validationState(low.error).fields?.quantity).toBe("Quantity must be at least 1.");
    const contact = contactSchema.safeParse({ name: "A", email: "not-an-email", message: "short" });
    expect(contact.success).toBe(false);
    if (!contact.success) {
      const state = validationState(contact.error);
      expect(state.focus).toBe("name");
      expect(state.fields?.name).toBe("Enter your name.");
      expect(state.fields?.email).toBe("Enter a valid email address.");
      expect(state.fields?.message).toBe("Enter a message of at least 10 characters.");
    }
    const signIn = signInSchema.safeParse({ email: "bad", password: "short" });
    expect(signIn.success).toBe(false);
    if (!signIn.success) {
      expect(validationState(signIn.error).fields?.password).toBe("Password must be at least 8 characters.");
    }
  });

  it("defaults shop sort and page", () => {
    const parsed = shopFilterSchema.parse({});
    expect(parsed.sort).toBe("featured");
    expect(parsed.page).toBe(1);
  });
});
