"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { searchHaystack } from "@/lib/catalog/helpers";
import type { CatalogProduct } from "@/lib/catalog/types";

export function CatalogSearch({ products, initialQuery }: { products: CatalogProduct[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const needle = query.trim().toLowerCase();
  const matches = needle ? products.filter((product) => searchHaystack(product).includes(needle)) : [];

  return (
    <>
      <div className="mt-8 max-w-xl">
        <label className="sr-only" htmlFor="search-q">
          Search
        </label>
        <Input
          id="search-q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, description, brand, notes"
          autoComplete="off"
        />
      </div>
      <div className="mt-12" aria-live="polite">
        {needle && matches.length ? (
          <ProductGrid products={matches} />
        ) : (
          <EmptyState title={needle ? "No matches" : "Search for a perfume"}>
            <p>Try citrus, oud, musk, or a product name.</p>
          </EmptyState>
        )}
      </div>
    </>
  );
}
