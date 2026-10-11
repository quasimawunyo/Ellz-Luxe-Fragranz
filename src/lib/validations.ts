import { z } from "zod";
import { GHANA_REGIONS } from "@/lib/ghana";

export const quantitySchema = z.coerce.number().int().min(1).max(6);

export const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: quantitySchema,
});

export const updateCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(6),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  message: z.string().trim().min(10).max(4000),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number."),
  region: z.enum(GHANA_REGIONS),
  locality: z.string().trim().min(2).max(120),
  addressLine: z.string().trim().min(4).max(200),
  deliveryMethodId: z.string().min(1),
  notes: z.string().trim().max(500).optional(),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2).max(120),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional(),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(8000),
  brand: z.string().trim().min(1).max(120),
  concentration: z.string().trim().max(80).optional(),
  categoryId: z.string().min(1),
  featured: z.boolean().default(false),
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
  sort: z
    .enum(["featured", "newest", "price-asc", "price-desc"])
    .default("featured"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShopFilters = z.infer<typeof shopFilterSchema>;
