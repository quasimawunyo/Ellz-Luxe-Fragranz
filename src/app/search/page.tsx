import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryShop } from "@/lib/catalog/queries";
import Link from "next/link";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const result = await queryShop(raw);
  const q = result.filters.q ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Search" }]} />
      <h1 className="mt-6 font-serif text-4xl">Search</h1>
      <form className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row" method="get">
        <label className="sr-only" htmlFor="search-q">
          Search
        </label>
        <Input id="search-q" name="q" defaultValue={q} placeholder="Name, description, brand, notes" />
        <Button type="submit">Search</Button>
        <Link href="/search" className="grid place-items-center px-3 text-sm text-taupe">
          Reset
        </Link>
      </form>
      <div className="mt-12">
        {q && result.items.length ? (
          <ProductGrid products={result.items} />
        ) : (
          <EmptyState title={q ? "No matches" : "Begin a search"}>
            <p>Try citrus, oud, musk, or a product name.</p>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
