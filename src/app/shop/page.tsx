import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/filters";
import { EmptyState } from "@/components/ui/states";
import { queryShop } from "@/lib/catalog/queries";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const result = await queryShop(raw);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} />
      <h1 className="mt-8 font-serif text-4xl">Shop</h1>
      <p className="mt-3 max-w-xl text-taupe">Perfumes from Ells Luxe Annex. Testers are marked on each product.</p>
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
            <ProductGrid products={result.items} className="lg:grid-cols-3" />
          ) : (
            <EmptyState title="No products match">
              <p>Try different filters or reset.</p>
            </EmptyState>
          )}
          {result.totalPages > 1 ? (
            <div className="mt-10 flex justify-center gap-3">
              {Array.from({ length: result.totalPages }, (_, index) => {
                const page = index + 1;
                const params = new URLSearchParams();
                if (result.filters.q) params.set("q", result.filters.q);
                if (result.filters.collection) params.set("collection", result.filters.collection);
                if (result.filters.category) params.set("category", result.filters.category);
                if (result.filters.brand) params.set("brand", result.filters.brand);
                if (result.filters.sort) params.set("sort", result.filters.sort);
                params.set("page", String(page));
                return (
                  <Link
                    key={page}
                    href={`/shop?${params.toString()}`}
                    className={`grid size-10 place-items-center border ${
                      page === result.page ? "border-espresso bg-espresso text-ivory" : "border-espresso/20"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
