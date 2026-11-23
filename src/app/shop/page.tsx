import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShopExplorer } from "@/components/shop/shop-explorer";
import { queryShop } from "@/lib/catalog/queries";
import { pageMetadata } from "@/lib/seo";
import { PAGE_DESCRIPTIONS } from "@/lib/seo-copy";

export const metadata = pageMetadata({
  title: "Shop",
  description: PAGE_DESCRIPTIONS.shop,
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const result = await queryShop(await searchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} />
      <h1 className="mt-8 font-serif text-4xl">Shop</h1>
      <ShopExplorer
        products={result.browse}
        filters={result.filters}
        collections={result.collections}
        categories={result.categories}
      />
    </div>
  );
}
