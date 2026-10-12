export type ProductStatus = "draft" | "published" | "archived";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  sizeMl: number | null;
  priceMinor: number;
  compareAtMinor: number | null;
  stock: number;
};

export type FragranceNotes = {
  top: string[];
  heart: string[];
  base: string[];
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  concentration: string | null;
  categoryId: string;
  categoryName?: string;
  collectionIds: string[];
  featured: boolean;
  newArrival: boolean;
  status: ProductStatus;
  isDemonstration: boolean;
  notes: FragranceNotes;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
};

export type CatalogCollection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
};

export type DeliveryMethod = {
  id: string;
  label: string;
  amountMinor: number;
  description: string;
};

export type StoreSettings = {
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  instagramUrl: string;
  tiktokUrl: string;
  snapchatHandle: string;
  momoNumber: string;
  momoMerchantId: string;
  bankName: string;
  bankAccount: string;
  currencyCode: string;
  shippingNote: string;
  returnsNote: string;
  privacyNote: string;
  termsNote: string;
  aboutStory: string;
  deliveryMethods: DeliveryMethod[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  requiresOwnerReview: boolean;
};
