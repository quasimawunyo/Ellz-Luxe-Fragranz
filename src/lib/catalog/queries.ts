import { DEMO_CATEGORIES, DEMO_COLLECTIONS, DEMO_FAQS, DEMO_PRODUCTS, DEMO_SETTINGS } from "@/lib/catalog/seed";
import { filterProducts, paginate, relatedProducts } from "@/lib/catalog/helpers";
import type { CatalogProduct, StoreSettings } from "@/lib/catalog/types";
import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/json-cookie";
import { isSupabaseConfigured } from "@/lib/env";
import { createUserSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { shopFilterSchema, type ShopFilters } from "@/lib/validations";

const STOCK_COOKIE = "elf_stock";

async function demoStockOverlay() {
  return readJsonCookie<Record<string, number>>(STOCK_COOKIE, {});
}

export async function setDemoStock(variantId: string, stock: number) {
  const overlay = await demoStockOverlay();
  overlay[variantId] = stock;
  await writeJsonCookie(STOCK_COOKIE, overlay);
}

function applyStock(products: CatalogProduct[], overlay: Record<string, number>) {
  return products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      stock: overlay[variant.id] ?? variant.stock,
    })),
  }));
}

function withCategoryNames(
  products: CatalogProduct[],
  categories: { id: string; name: string }[],
) {
  const names = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  return products.map((product) => ({
    ...product,
    categoryName: product.categoryName ?? names[product.categoryId] ?? product.brand,
  }));
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) return DEMO_SETTINGS;
  const supabase = await createUserSupabase();
  if (!supabase) return DEMO_SETTINGS;
  const { data } = await supabase.from("store_settings").select("key, value");
  if (!data?.length) return DEMO_SETTINGS;
  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    announcement: String(map.announcement ?? DEMO_SETTINGS.announcement),
    contactEmail: String(map.contact_email ?? DEMO_SETTINGS.contactEmail),
    contactPhone: String(map.contact_phone ?? DEMO_SETTINGS.contactPhone),
    location: String(map.location ?? DEMO_SETTINGS.location),
    instagramUrl: String(map.instagram_url ?? DEMO_SETTINGS.instagramUrl),
    tiktokUrl: String(map.tiktok_url ?? DEMO_SETTINGS.tiktokUrl),
    snapchatHandle: String(map.snapchat_handle ?? DEMO_SETTINGS.snapchatHandle),
    momoNumber: String(map.momo_number ?? DEMO_SETTINGS.momoNumber),
    momoMerchantId: String(map.momo_merchant_id ?? DEMO_SETTINGS.momoMerchantId),
    bankName: String(map.bank_name ?? DEMO_SETTINGS.bankName),
    bankAccount: String(map.bank_account ?? DEMO_SETTINGS.bankAccount),
    currencyCode: String(map.currency_code ?? "GHS"),
    shippingNote: String(map.shipping_note ?? DEMO_SETTINGS.shippingNote),
    returnsNote: String(map.returns_note ?? DEMO_SETTINGS.returnsNote),
    privacyNote: String(map.privacy_note ?? DEMO_SETTINGS.privacyNote),
    termsNote: String(map.terms_note ?? DEMO_SETTINGS.termsNote),
    aboutStory: String(map.about_story ?? DEMO_SETTINGS.aboutStory),
    deliveryMethods: (map.delivery_methods as StoreSettings["deliveryMethods"]) ?? DEMO_SETTINGS.deliveryMethods,
  };
}

export async function getFaqs() {
  if (!isSupabaseConfigured()) return DEMO_FAQS;
  const supabase = await createUserSupabase();
  if (!supabase) return DEMO_FAQS;
  const { data } = await supabase.from("faq_items").select("*").order("position");
  if (!data?.length) return DEMO_FAQS;
  return data.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    requiresOwnerReview: row.requires_owner_review,
  }));
}

export async function getCollections() {
  if (!isSupabaseConfigured()) return DEMO_COLLECTIONS;
  const supabase = await createUserSupabase();
  if (!supabase) return DEMO_COLLECTIONS;
  const { data } = await supabase.from("collections").select("*").order("name");
  if (!data?.length) return DEMO_COLLECTIONS;
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
  }));
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return DEMO_CATEGORIES;
  const supabase = await createUserSupabase();
  if (!supabase) return DEMO_CATEGORIES;
  const { data } = await supabase.from("categories").select("*").order("name");
  if (!data?.length) return DEMO_CATEGORIES;
  return data.map((row) => ({ id: row.id, slug: row.slug, name: row.name }));
}

async function loadAllProducts(): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    const overlay = await demoStockOverlay();
    return withCategoryNames(applyStock(DEMO_PRODUCTS, overlay), DEMO_CATEGORIES);
  }
  const supabase = createServiceClient() ?? (await createUserSupabase());
  if (!supabase) {
    const overlay = await demoStockOverlay();
    return withCategoryNames(applyStock(DEMO_PRODUCTS, overlay), DEMO_CATEGORIES);
  }

  const { data: products } = await supabase.from("products").select("*");
  const { data: variants } = await supabase.from("product_variants").select("*");
  const { data: images } = await supabase.from("product_images").select("*");
  const { data: links } = await supabase.from("collection_products").select("*");
  const { data: categories } = await supabase.from("categories").select("id, name");
  if (!products?.length) {
    const overlay = await demoStockOverlay();
    return withCategoryNames(applyStock(DEMO_PRODUCTS, overlay), DEMO_CATEGORIES);
  }

  return withCategoryNames(products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    brand: product.brand,
    concentration: product.concentration,
    categoryId: product.category_id,
    collectionIds: (links ?? [])
      .filter((link) => link.product_id === product.id)
      .map((link) => link.collection_id),
    featured: product.featured,
    newArrival: Boolean(product.new_arrival),
    status: product.status,
    isDemonstration: product.is_demonstration,
    notes: {
      top: product.top_notes,
      heart: product.heart_notes,
      base: product.base_notes,
    },
    images: (images ?? [])
      .filter((image) => image.product_id === product.id)
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        position: image.position,
      })),
    variants: (variants ?? [])
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        label: variant.label,
        sizeMl: variant.size_ml,
        priceMinor: variant.price_minor,
        compareAtMinor: variant.compare_at_minor,
        stock: variant.stock,
      })),
    createdAt: product.created_at,
  })), categories ?? []);
}

export async function getPublishedProducts() {
  const all = await loadAllProducts();
  return all.filter((product) => product.status === "published");
}

export async function getAllProductsForAdmin() {
  return loadAllProducts();
}

export async function getProductBySlug(slug: string) {
  const products = await getPublishedProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const products = await loadAllProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function getVariantById(variantId: string) {
  const products = await loadAllProducts();
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

export async function getFeaturedProducts() {
  return (await getPublishedProducts()).filter((product) => product.featured);
}

export async function getNewArrivals() {
  const products = await getPublishedProducts();
  return [...products]
    .sort((a, b) => {
      const flagged = Number(b.newArrival) - Number(a.newArrival);
      if (flagged) return flagged;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 8);
}

export async function getRelated(product: CatalogProduct) {
  return relatedProducts(product, await getPublishedProducts());
}

export async function queryShop(raw: Record<string, string | string[] | undefined>) {
  const parsed = shopFilterSchema.safeParse({
    q: Array.isArray(raw.q) ? raw.q[0] : raw.q,
    collection: Array.isArray(raw.collection) ? raw.collection[0] : raw.collection,
    category: Array.isArray(raw.category) ? raw.category[0] : raw.category,
    brand: Array.isArray(raw.brand) ? raw.brand[0] : raw.brand,
    min: Array.isArray(raw.min) ? raw.min[0] : raw.min,
    max: Array.isArray(raw.max) ? raw.max[0] : raw.max,
    sort: Array.isArray(raw.sort) ? raw.sort[0] : raw.sort,
    arrival: Array.isArray(raw.arrival) ? raw.arrival[0] : raw.arrival,
    page: Array.isArray(raw.page) ? raw.page[0] : raw.page,
  });
  const filters: ShopFilters = parsed.success
    ? parsed.data
    : { sort: "featured", page: 1 };

  const collections = await getCollections();
  const collection = collections.find(
    (item) => item.slug === filters.collection || item.id === filters.collection,
  );
  const products = await getPublishedProducts();
  const filtered = filterProducts(
    products,
    { ...filters, collection: collection?.id ?? filters.collection },
  );
  return {
    filters,
    collections,
    categories: await getCategories(),
    ...paginate(filtered, filters.page),
  };
}

export async function getCollectionBySlug(slug: string) {
  const collections = await getCollections();
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function getCollectionProducts(slug: string) {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { collection: null, products: [] as CatalogProduct[] };
  const products = (await getPublishedProducts()).filter((product) =>
    product.collectionIds.includes(collection.id),
  );
  return { collection, products };
}
