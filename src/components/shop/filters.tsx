import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import type { CatalogCategory, CatalogCollection } from "@/lib/catalog/types";
import type { ShopFilters } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ShopFilters({
  filters,
  collections,
  categories,
}: {
  filters: ShopFilters;
  collections: CatalogCollection[];
  categories: CatalogCategory[];
}) {
  return (
    <form className="space-y-6" method="get">
      <div>
        <Label htmlFor="q">Search</Label>
        <Input id="q" name="q" defaultValue={filters.q ?? ""} placeholder="Name, notes, brand" />
      </div>
      <div>
        <Label htmlFor="collection">Collection</Label>
        <select
          id="collection"
          name="collection"
          defaultValue={filters.collection ?? ""}
          className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
        >
          <option value="">All collections</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.slug}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="brand">Brand</Label>
        <select
          id="brand"
          name="brand"
          defaultValue={filters.brand ?? ""}
          className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
        >
          <option value="">All brands</option>
          {HOUSE_BRANDS.map((brand) => (
            <option key={brand.slug} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={filters.category ?? ""}
          className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="arrival" value="1" defaultChecked={filters.arrival === "1"} />
        New arrivals
      </label>
      <div>
        <Label htmlFor="sort">Sort</Label>
        <select
          id="sort"
          name="sort"
          defaultValue={filters.sort}
          className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Apply
      </Button>
      <Link href="/shop" className="block text-center text-sm text-taupe">
        Reset
      </Link>
    </form>
  );
}
