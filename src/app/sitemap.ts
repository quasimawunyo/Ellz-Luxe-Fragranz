import type { MetadataRoute } from "next";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { isDiscounted, stockedCollections } from "@/lib/catalog/helpers";
import { getCollections, getPublishedProducts } from "@/lib/catalog/queries";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getPublishedProducts(),
    getCollections(),
  ]);
  const onSale = products.some(isDiscounted);
  const stocked = stockedCollections(collections, products);
  const staticPaths = [
    "",
    "/shop",
    "/new",
    ...(onSale ? ["/sale"] : []),
    "/track",
    "/brands",
    "/collections",
    "/search",
    "/about",
    "/contact",
    "/faq",
    "/legal/privacy",
    "/legal/terms",
    "/legal/shipping",
    "/legal/returns",
  ];
  return [
    ...staticPaths.map((path) => ({
      url: `${env.siteUrl}${path}`,
      changeFrequency: "weekly" as const,
    })),
    ...products.map((product) => ({
      url: `${env.siteUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
    })),
    ...stocked.map((collection) => ({
      url: `${env.siteUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
    })),
    ...HOUSE_BRANDS.map((brand) => ({
      url: `${env.siteUrl}/brands/${brand.slug}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
