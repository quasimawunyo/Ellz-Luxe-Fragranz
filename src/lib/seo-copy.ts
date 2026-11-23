import { lowestPrice, publicDescription, shopVariants, sizeListLabel } from "@/lib/catalog/helpers";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/money";

export const HOME_DESCRIPTION =
  "EllzLuxe Fragranz: perfume boutique at Ells Luxe Annex, Pantang. Shop Lattafa, Armaf, Rasasi and more. Free pickup, delivery across Ghana.";

export const PAGE_DESCRIPTIONS = {
  home: HOME_DESCRIPTION,
  shop: "Browse all perfumes at EllzLuxe Fragranz. Filter by brand, collection and price. Free pickup in Pantang, delivery across Ghana in 24 to 72 hours.",
  new: "New arrivals at EllzLuxe Fragranz: the latest perfumes added to the shop. Free pickup in Pantang, delivery across Ghana.",
  collections:
    "Shop perfumes by collection: floral, fresh and citrus, men's, oud and oriental, unisex, women's, and woody and amber.",
  brands: "Perfume brands at EllzLuxe Fragranz, including Lattafa, Armaf, Rasasi, Khadlaj and Fragrance World.",
  about: "About EllzLuxe Fragranz, a perfume boutique at Ells Luxe Annex, Pantang, Ghana. Visit the shop, call, or message on WhatsApp.",
  contact: "Contact EllzLuxe Fragranz: visit Ells Luxe Annex in Pantang, call, send a WhatsApp message, or use the contact form.",
  faq: "Answers about ordering, delivery across Ghana, payment, choosing a fragrance, and returns at EllzLuxe Fragranz.",
  search: "Search EllzLuxe Fragranz by perfume name, brand, notes or description.",
  track: "Track your EllzLuxe Fragranz order with your order number and the email used at checkout.",
  shipping: "How delivery and free pickup work for an order from EllzLuxe Fragranz, Pantang, Ghana.",
  returns: "How returns and replacements work after you buy from EllzLuxe Fragranz, Pantang, Ghana.",
  privacy: "How your name, phone, and order details are used at EllzLuxe Fragranz, Pantang, Ghana.",
  terms: "The terms that apply when you buy a bottle from EllzLuxe Fragranz, Pantang, Ghana.",
  cart: "Review the bottles in your EllzLuxe Fragranz cart before free pickup in Pantang or delivery across Ghana.",
  checkout: "Place an EllzLuxe Fragranz order for free pickup in Pantang or delivery across Ghana.",
  sale: "Flash sales at EllzLuxe Fragranz, when a bottle is reduced. Free pickup in Pantang, delivery across Ghana.",
  login: "Sign in to your EllzLuxe Fragranz account to see your orders and the bottles you saved.",
  signup: "Create an EllzLuxe Fragranz account to track orders and save bottles you want to buy later.",
  forgot: "Request a link to reset the password for your EllzLuxe Fragranz account.",
  saved: "Bottles you have saved at EllzLuxe Fragranz, kept on this device until you are ready to order.",
  account: "Your EllzLuxe Fragranz account, with your name, phone number, and a link to your orders.",
  orders: "Orders placed with your EllzLuxe Fragranz account, including status and the amount due.",
  confirmation: "Your EllzLuxe Fragranz order confirmation, with the order number and what happens next.",
} as const;

export function collectionMetaDescription(tagline: string) {
  const line = tagline.replace(/\s+/g, " ").trim();
  const text = `${line} Shop at EllzLuxe Fragranz, Pantang, Ghana.`.replace(/\s+/g, " ").trim();
  return text.length > 155 ? text.slice(0, 155).trim() : text;
}

export function brandMetaDescription(brand: string) {
  return `Shop ${brand} perfumes at EllzLuxe Fragranz, Pantang, Ghana. Free pickup and delivery across Ghana.`;
}

export function productMetaDescription(product: CatalogProduct) {
  const sentence = publicDescription(product.description).replace(/\s+/g, " ").trim().replace(/\.+$/, "");
  const visible = shopVariants(product);
  const sizes = sizeListLabel(visible.flatMap((variant) => (variant.sizeMl ? [variant.sizeMl] : [])));
  const price = visible.length ? formatMoney(lowestPrice(product)) : "";
  const priced = visible.length > 1 && price ? `from ${price}` : price;
  const detail = [product.brand, product.name, sizes, priced].filter(Boolean).join(", ");
  let text = detail ? `${detail}.` : `${sentence}.`;
  if (sentence && !text.toLowerCase().includes(product.name.toLowerCase())) text = `${sentence}. ${text}`;
  if (text.length < 70) text = `${text} Free pickup in Pantang, delivery across Ghana.`;
  return text.length > 155 ? text.slice(0, 155).trim() : text;
}
