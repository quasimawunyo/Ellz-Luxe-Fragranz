import { z } from "zod";
import { GHANA_REGIONS } from "@/lib/ghana";

const quantityLow = "Quantity must be at least 1.";
const quantityHigh = "You can order up to 6 of this item.";

export const quantitySchema = z.coerce.number().int(quantityLow).min(1, quantityLow).max(6, quantityHigh);

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Choose a size."),
  quantity: quantitySchema,
});

export const updateCartItemSchema = z.object({
  variantId: z.string().min(1, "Choose a size."),
  quantity: z.coerce.number().int(quantityLow).min(0, quantityLow).max(6, quantityHigh),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const waitlistSchema = z.object({
  productId: z.string().min(1, "Choose a perfume."),
  email: z.email("Enter a valid email address."),
});

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
    email: z.string().trim().max(160).optional().default(""),
    phone: z.string().trim().max(20).optional().default(""),
    message: z
      .string()
      .trim()
      .min(10, "Enter a message of at least 10 characters.")
      .max(2000, "Keep the message under 2000 characters."),
  })
  .superRefine((value, ctx) => {
    const email = value.email.trim();
    const phone = value.phone.trim();
    if (!email && !phone) {
      ctx.addIssue({ code: "custom", message: "Enter a phone number or an email address.", path: ["email"] });
    }
    if (email && !z.email().safeParse(email).success) {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address.", path: ["email"] });
    }
    if (phone && !/^[0-9+\s-]{9,20}$/.test(phone)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid phone number.", path: ["phone"] });
    }
  });

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
  email: z.email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid phone number.")
    .max(20, "Enter a valid phone number.")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number."),
  region: z.enum(GHANA_REGIONS, "Choose a region."),
  locality: z.string().trim().min(2, "Enter your town or area.").max(120, "Town or area must be 120 characters or fewer."),
  addressLine: z.string().trim().min(4, "Enter your address.").max(200, "Address must be 200 characters or fewer."),
  deliveryMethodId: z.string().min(1, "Choose a delivery method."),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer.").optional(),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72, "Password must be 72 characters or fewer."),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
  phone: z.string().trim().max(20, "Enter a valid phone number.").optional(),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(8000),
  brand: z.string().trim().min(1).max(120),
  concentration: z.string().trim().max(80).optional(),
  categoryId: z.string().min(1),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]),
  topNotes: z.string().trim().max(240).optional(),
  heartNotes: z.string().trim().max(240).optional(),
  baseNotes: z.string().trim().max(240).optional(),
  isDemonstration: z.boolean().default(true),
  imageUrl: z.string().trim().max(500).optional(),
  imageAlt: z.string().trim().max(200).optional(),
});

export const variantInputSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  label: z.string().trim().min(1).max(80),
  sizeMl: z.coerce.number().int().positive().optional(),
  priceMinor: z.coerce.number().int().min(0),
  compareAtMinor: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0),
});

export const shopFilterSchema = z.object({
  q: z.string().trim().max(120).optional(),
  collection: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  brand: z.string().trim().max(120).optional(),
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  arrival: z.enum(["1"]).optional(),
  sort: z
    .enum(["featured", "newest", "price-asc", "price-desc"])
    .default("featured"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShopFilters = z.infer<typeof shopFilterSchema>;
