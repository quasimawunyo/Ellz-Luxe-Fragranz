import type { MetadataRoute } from "next";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { getCollections, getPublishedProducts } from "@/lib/catalog/queries";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getPublishedProducts(),
    getCollections(),
  ]);
  const staticPaths = [
    "",
    "/shop",
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
    ...collections.map((collection) => ({
      url: `${env.siteUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
    })),
    ...HOUSE_BRANDS.map((brand) => ({
      url: `${env.siteUrl}/brands/${brand.slug}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
