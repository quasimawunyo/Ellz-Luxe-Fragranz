import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import type { CatalogCategory, CatalogCollection } from "@/lib/catalog/types";
import type { ShopFilters as ShopFilterState } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function hrefFor(filters: ShopFilterState, patch: Partial<ShopFilterState>) {
  const params = new URLSearchParams();
  const next = { ...filters, ...patch };
  if (next.q) params.set("q", next.q);
  if (next.collection) params.set("collection", next.collection);
  if (next.category) params.set("category", next.category);
  if (next.brand) params.set("brand", next.brand);
  if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
  if (next.arrival === "1") params.set("arrival", "1");
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function ShopFilters({
  filters,
  collections,
  categories,
}: {
  filters: ShopFilterState;
  collections: CatalogCollection[];
  categories: CatalogCategory[];
}) {
  return (
    <div className="space-y-8">
      <form className="space-y-4" method="get">
        <div>
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={filters.q ?? ""} placeholder="Name, notes, house" />
        </div>
        <div>
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="min-h-11 w-full border-b border-espresso/20 bg-transparent py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        {filters.collection ? <input type="hidden" name="collection" value={filters.collection} /> : null}
        {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
        {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
        {filters.arrival === "1" ? <input type="hidden" name="arrival" value="1" /> : null}
        <Button type="submit" variant="outline" className="w-full">
          Apply
        </Button>
      </form>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Collection</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href={hrefFor(filters, { collection: undefined })} className={cn(!filters.collection && "text-espresso")}>
              All
            </Link>
          </li>
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={hrefFor(filters, { collection: collection.slug })}
                className={cn(filters.collection === collection.slug ? "text-espresso" : "text-taupe hover:text-espresso")}
              >
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">House</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href={hrefFor(filters, { brand: undefined })} className={cn(!filters.brand && "text-espresso")}>
              All
            </Link>
          </li>
          {HOUSE_BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={hrefFor(filters, { brand: brand.slug })}
                className={cn(filters.brand === brand.slug ? "text-espresso" : "text-taupe hover:text-espresso")}
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Family</p>
        <ul className="mt-3 space-y-2 text-sm">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={hrefFor(filters, { category: category.id })}
                className={cn(filters.category === category.id ? "text-espresso" : "text-taupe hover:text-espresso")}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={hrefFor(filters, { arrival: filters.arrival === "1" ? undefined : "1" })}
        className={cn("block text-sm", filters.arrival === "1" ? "text-espresso" : "text-taupe")}
      >
        New arrivals
      </Link>
      <Link href="/shop" className="block text-sm text-taupe hover:text-espresso">
        Reset
      </Link>
    </div>
  );
}
