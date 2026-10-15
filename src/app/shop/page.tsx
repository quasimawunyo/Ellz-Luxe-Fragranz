import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/filters";
import { EmptyState } from "@/components/ui/states";
import { getStoreSettings, queryShop } from "@/lib/catalog/queries";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const [result, settings] = await Promise.all([queryShop(raw), getStoreSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} />
      <h1 className="mt-8 font-serif text-5xl md:text-6xl">Shop</h1>
      <p className="mt-4 max-w-xl text-taupe">Bottles at {settings.location}.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside>
          <ShopFilters
            filters={result.filters}
            collections={result.collections}
            categories={result.categories}
          />
        </aside>
        <div>
          {result.items.length ? (
            <ProductGrid products={result.items} />
          ) : (
            <EmptyState title="No products match">
              <p>Try different filters or reset.</p>
            </EmptyState>
          )}
          {result.totalPages > 1 ? (
            <div className="mt-12 flex justify-center gap-8 text-sm">
              {(() => {
                const paramsFor = (page: number) => {
                  const params = new URLSearchParams();
                  if (result.filters.q) params.set("q", result.filters.q);
                  if (result.filters.collection) params.set("collection", result.filters.collection);
                  if (result.filters.category) params.set("category", result.filters.category);
                  if (result.filters.brand) params.set("brand", result.filters.brand);
                  if (result.filters.sort) params.set("sort", result.filters.sort);
                  if (result.filters.arrival) params.set("arrival", result.filters.arrival);
                  params.set("page", String(page));
                  return `/shop?${params.toString()}`;
                };
                return (
                  <>
                    {result.page > 1 ? <Link href={paramsFor(result.page - 1)}>Previous</Link> : null}
                    <span className="text-taupe">
                      {result.page} / {result.totalPages}
                    </span>
                    {result.page < result.totalPages ? <Link href={paramsFor(result.page + 1)}>Next</Link> : null}
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
