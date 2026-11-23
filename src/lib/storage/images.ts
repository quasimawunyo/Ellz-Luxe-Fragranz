export const PRODUCT_IMAGE_HOST = "images.ellzluxefragranz.com";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function productImageExtension(contentType: string) {
  return TYPES[contentType] ?? null;
}

export function productImageKey(productId: string, contentType: string, id = crypto.randomUUID()) {
  const extension = productImageExtension(contentType);
  if (!extension) throw new Error("Use a JPEG, PNG, or WebP photo.");
  const safeId = productId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeId) throw new Error("Choose a product before adding a photo.");
  return `products/${safeId}/${id}.${extension}`;
}

export function productImageUrl(publicBaseUrl: string, key: string) {
  const base = publicBaseUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}
