export type CartItem = {
  variantId: string;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type ResolvedCartLine = {
  variantId: string;
  quantity: number;
  sku: string;
  label: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  imageAlt: string;
  unitMinor: number;
  lineMinor: number;
  stock: number;
  maxQuantity: number;
};

export type ResolvedCart = {
  lines: ResolvedCartLine[];
  subtotalMinor: number;
  currencyCode: string;
  itemCount: number;
};
