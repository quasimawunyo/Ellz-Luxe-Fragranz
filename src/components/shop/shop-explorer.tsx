"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductGrid } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/filters";
import { EmptyState } from "@/components/ui/states";
import { PAGE_SIZE, searchHaystack } from "@/lib/catalog/helpers";
import type { CatalogCategory, CatalogCollection, CatalogProduct } from "@/lib/catalog/types";
import type { ShopFilters as ShopFilterValues } from "@/lib/validations";

export function ShopExplorer({
  products,
  filters,
  collections,
  categories,
}: {
  products: CatalogProduct[];
  filters: ShopFilterValues;
  collections: CatalogCollection[];
  categories: CatalogCategory[];
}) {
  const [query, setQuery] = useState(filters.q ?? "");
  const [page, setPage] = useState(filters.page);
  const needle = query.trim().toLowerCase();
  const matched = needle ? products.filter((product) => searchHaystack(product).includes(needle)) : products;
  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = matched.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
      <aside>
        <details className="rounded-[1.25rem] border border-espresso/10 bg-white p-4 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium">Filters</summary>
          <div className="mt-4">
            <ShopFilters
              idPrefix="mobile"
              filters={filters}
              collections={collections}
              categories={categories}
              query={query}
              onQueryChange={changeQuery}
            />
          </div>
        </details>
        <div className="hidden lg:block">
          <ShopFilters
            idPrefix="desktop"
            filters={filters}
            collections={collections}
            categories={categories}
            query={query}
            onQueryChange={changeQuery}
          />
        </div>
      </aside>
      <div>
        <div aria-live="polite">
          {visible.length ? (
            <ProductGrid products={visible} />
          ) : (
            <EmptyState title="No products match">
              <p>Try a different search, or reset filters.</p>
              <Link href="/shop" className="mt-3 inline-block underline">
                Reset shop
              </Link>
            </EmptyState>
          )}
        </div>
        {totalPages > 1 ? (
          <div className="mt-10 flex justify-center gap-3">
            {Array.from({ length: totalPages }, (_, index) => {
              const number = index + 1;
              const active = number === currentPage;
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`grid size-11 place-items-center border ${
                    active ? "border-espresso bg-espresso text-ivory" : "border-espresso/20"
                  }`}
                >
                  {number}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
