import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CatalogSearch } from "@/components/search/catalog-search";
import { filterProducts } from "@/lib/catalog/helpers";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { pageMetadata } from "@/lib/seo";
import { PAGE_DESCRIPTIONS } from "@/lib/seo-copy";

export const metadata = pageMetadata({
  title: "Search",
  description: PAGE_DESCRIPTIONS.search,
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const value = raw.q;
  const q = (Array.isArray(value) ? value[0] : value) ?? "";
  const products = filterProducts(await getPublishedProducts(), { sort: "featured", page: 1 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Search" }]} />
      <h1 className="mt-6 font-serif text-4xl">Search</h1>
      <CatalogSearch products={products} initialQuery={q} />
    </div>
  );
}
