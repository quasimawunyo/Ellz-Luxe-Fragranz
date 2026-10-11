"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { useSavedLists } from "@/lib/saved/use-saved-lists";
import type { CatalogProduct } from "@/lib/catalog/types";

export function SavedShelves({ products }: { products: CatalogProduct[] }) {
  const { likes, waiting } = useSavedLists();
  const liked = products.filter((product) => likes.includes(product.id));
  const restock = products.filter((product) => waiting.includes(product.id));

  return (
    <div className="space-y-14">
      <section>
        <h2 className="font-serif text-3xl">Liked</h2>
        <p className="mt-2 text-sm text-taupe">Bottles you marked with the heart.</p>
        <div className="mt-8">
          {liked.length ? (
            <ProductGrid products={liked} />
          ) : (
            <EmptyState title="No liked bottles yet">
              <p>
                Tap the heart on a product. <Link href="/shop">Shop</Link>
              </p>
            </EmptyState>
          )}
        </div>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Waiting for restock</h2>
        <p className="mt-2 text-sm text-taupe">We will email you when these return. This is not a paid hold.</p>
        <div className="mt-8">
          {restock.length ? (
            <ProductGrid products={restock} />
          ) : (
            <EmptyState title="Nothing on the restock list">
              <p>When a bottle is out of stock, choose Notify me.</p>
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}
