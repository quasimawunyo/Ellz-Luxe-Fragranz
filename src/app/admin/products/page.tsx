import Image from "next/image";
import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { primaryImage } from "@/lib/catalog/helpers";
import { formatMoney } from "@/lib/money";
import { stockState, type StockState } from "@/lib/stock";
import { StockBadge } from "@/components/admin/stock-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products · Admin" };

const FILTERS: Array<{ id: "all" | StockState; label: string }> = [
  { id: "all", label: "All" },
  { id: "in_stock", label: "In stock" },
  { id: "low_stock", label: "Low stock" },
  { id: "out_of_stock", label: "Out of stock" },
  { id: "not_tracked", label: "Not tracked" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = FILTERS.some((item) => item.id === params.status) ? (params.status as "all" | StockState) : "all";
  const query = (params.q ?? "").trim().toLowerCase();
  const products = await getAllProductsForAdmin();
  const rows = products
    .flatMap((product) => {
      const image = primaryImage(product);
      return product.variants.map((variant) => ({
        product,
        variant,
        image,
        state: stockState(variant),
      }));
    })
    .filter((row) => (status === "all" ? true : row.state === status))
    .filter((row) => {
      if (!query) return true;
      return row.product.name.toLowerCase().includes(query) || row.product.brand.toLowerCase().includes(query);
    })
    .sort((a, b) => a.product.name.localeCompare(b.product.name) || (a.variant.sizeMl ?? 0) - (b.variant.sizeMl ?? 0));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-taupe">
            {rows.length} {rows.length === 1 ? "size" : "sizes"}. Untracked bottles stay for sale until you set opening stock.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/admin/products/opening" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
            Set opening stock
          </Link>
          <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "shop" }), "w-full sm:w-auto")}>
            New bottle
          </Link>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center" action="/admin/products">
        <label className="sr-only" htmlFor="product-search">
          Search by name or brand
        </label>
        <input
          id="product-search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or brand"
          className="h-11 w-full border border-espresso/15 px-3 text-sm sm:max-w-xs"
        />
        {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        <button type="submit" className="h-11 px-4 text-sm text-espresso underline underline-offset-4">
          Search
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const href = item.id === "all" ? "/admin/products" : `/admin/products?status=${item.id}`;
          const active = status === item.id;
          return (
            <Link
              key={item.id}
              href={query ? `${href}${href.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}` : href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3 text-sm",
                active ? "bg-espresso text-ivory" : "border border-espresso/10 bg-white text-espresso",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 space-y-3 lg:hidden">
        {rows.map((row) => (
          <li key={row.variant.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-3">
            <div className="flex gap-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-espresso/5">
                {row.image ? (
                  <Image src={row.image.url} alt={row.product.name} fill className="object-cover" sizes="64px" />
                ) : null}
              </span>
              <div className="min-w-0">
                <p className="font-medium">{row.product.name}</p>
                <p className="text-sm text-taupe">{row.product.brand}</p>
                <p className="mt-1 text-sm">
                  {row.variant.label} · {formatMoney(row.variant.priceMinor)}
                </p>
                <p className="mt-1 text-sm">{row.variant.trackStock ? row.variant.stockQuantity : "—"}</p>
                <div className="mt-2">
                  <StockBadge state={row.state} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <Link href={`/admin/products/${row.product.id}`} className="text-espresso underline underline-offset-4">
                Edit
              </Link>
              <Link href={`/admin/products/stock/${row.variant.id}`} className="text-leaf underline underline-offset-4">
                Adjust stock
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="luxe-panel mt-8 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs text-taupe">
              <th className="px-4 py-3">Photo</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Size</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variant.id} className="border-b border-espresso/10 last:border-0">
                <td className="px-4 py-3">
                  <span className="relative block size-12 overflow-hidden bg-espresso/5">
                    {row.image ? (
                      <Image src={row.image.url} alt={row.product.name} fill className="object-cover" sizes="48px" />
                    ) : null}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/products/${row.product.id}`} className="font-medium hover:text-champagne">
                    {row.product.name}
                  </Link>
                </td>
                <td>{row.product.brand}</td>
                <td>{row.variant.label}</td>
                <td>{formatMoney(row.variant.priceMinor)}</td>
                <td>{row.variant.trackStock ? row.variant.stockQuantity : "—"}</td>
                <td>
                  <StockBadge state={row.state} />
                </td>
                <td className="pr-4 text-right">
                  <Link href={`/admin/products/stock/${row.variant.id}`} className="text-leaf underline underline-offset-4">
                    Adjust stock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? <p className="mt-8 text-sm text-taupe">No sizes match that filter.</p> : null}
    </div>
  );
}
