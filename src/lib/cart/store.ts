import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/json-cookie";
import type { CartItem, CartState, ResolvedCart } from "@/lib/cart/types";
import { getVariantById, getStoreSettings } from "@/lib/catalog/queries";
import { lineTotalMinor } from "@/lib/money";
import { assertPurchasableQuantity } from "@/lib/inventory";

const CART_ITEMS_COOKIE = "elf_cart";
const CART_ID_COOKIE = "elf_cart_id";

async function readCookieCart(): Promise<CartState> {
  return readJsonCookie<CartState>(CART_ITEMS_COOKIE, { items: [] });
}

async function writeCookieCart(state: CartState) {
  await writeJsonCookie(CART_ITEMS_COOKIE, state);
}

async function readCartId() {
  const store = await cookies();
  return store.get(CART_ID_COOKIE)?.value;
}

function cartIdCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  };
}

async function getOrCreateCartId() {
  const existing = await readCartId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  const store = await cookies();
  try {
    store.set(CART_ID_COOKIE, id, cartIdCookieOptions());
  } catch {
    // Cookie writes are only allowed in Server Actions / Route Handlers.
  }
  return id;
}

export async function getCartItems(): Promise<CartItem[]> {
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    const cartId = await readCartId();
    if (admin && cartId) {
      const { data } = await admin
        .from("cart_items")
        .select("variant_id, quantity")
        .eq("cart_id", cartId);
      if (data) {
        return data.map((row) => ({ variantId: row.variant_id, quantity: row.quantity }));
      }
    }
  }
  return (await readCookieCart()).items;
}

export async function saveCartItems(items: CartItem[]) {
  const next = items.filter((item) => item.quantity > 0);
  await writeCookieCart({ items: next });
  if (isSupabaseAdminConfigured()) {
    const admin = createServiceClient();
    if (admin) {
      const cartId = await getOrCreateCartId();
      await admin.from("carts").upsert({ id: cartId });
      await admin.from("cart_items").delete().eq("cart_id", cartId);
      if (next.length) {
        await admin.from("cart_items").insert(
          next.map((item) => ({
            cart_id: cartId,
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
        );
      }
    }
  }
}

export async function addItemToCart(variantId: string, quantity: number) {
  assertPurchasableQuantity(quantity);
  const match = await getVariantById(variantId);
  if (!match || match.product.status !== "published") {
    throw new Error("That product is unavailable.");
  }
  if (match.variant.stock < 1) {
    throw new Error("This size is currently out of stock.");
  }
  const items = await getCartItems();
  const existing = items.find((item) => item.variantId === variantId);
  const nextQty = (existing?.quantity ?? 0) + quantity;
  assertPurchasableQuantity(nextQty);
  if (nextQty > match.variant.stock) {
    throw new Error("Not enough stock for that quantity.");
  }
  if (existing) existing.quantity = nextQty;
  else items.push({ variantId, quantity: nextQty });
  await saveCartItems(items);
}

export async function updateCartQuantity(variantId: string, quantity: number) {
  const items = await getCartItems();
  if (quantity === 0) {
    await saveCartItems(items.filter((item) => item.variantId !== variantId));
    return;
  }
  assertPurchasableQuantity(quantity);
  const match = await getVariantById(variantId);
  if (!match) throw new Error("Unknown variant.");
  if (quantity > match.variant.stock) {
    throw new Error("Not enough stock for that quantity.");
  }
  const existing = items.find((item) => item.variantId === variantId);
  if (!existing) items.push({ variantId, quantity });
  else existing.quantity = quantity;
  await saveCartItems(items);
}

export async function clearCart() {
  await saveCartItems([]);
}

export async function resolveCart(): Promise<ResolvedCart> {
  const settings = await getStoreSettings();
  const items = await getCartItems();
  const lines = [];
  for (const item of items) {
    const match = await getVariantById(item.variantId);
    if (!match || match.product.status !== "published") continue;
    const image = match.product.images[0];
    lines.push({
      variantId: match.variant.id,
      quantity: item.quantity,
      sku: match.variant.sku,
      label: match.variant.label,
      productId: match.product.id,
      productName: match.product.name,
      productSlug: match.product.slug,
      imageUrl: image?.url ?? "/images/products/citrus.jpg",
      imageAlt: image?.alt ?? match.product.name,
      unitMinor: match.variant.priceMinor,
      lineMinor: lineTotalMinor(match.variant.priceMinor, item.quantity),
      stock: match.variant.stock,
      maxQuantity: Math.min(6, match.variant.stock),
    });
  }
  return {
    lines,
    subtotalMinor: lines.reduce((sum, line) => sum + line.lineMinor, 0),
    currencyCode: settings.currencyCode,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}
