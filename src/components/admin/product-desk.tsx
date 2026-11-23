"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { StockBadge } from "@/components/admin/stock-badge";
import { primaryImage } from "@/lib/catalog/helpers";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/money";
import { stockState, type StockState } from "@/lib/stock";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | StockState; label: string }> = [
  { id: "all", label: "All" },
  { id: "in_stock", label: "In stock" },
  { id: "low_stock", label: "Low stock" },
  { id: "out_of_stock", label: "Out of stock" },
  { id: "not_tracked", label: "Not tracked" },
];

function matchesName(product: { name: string; brand: string }, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return product.name.toLowerCase().includes(needle) || product.brand.toLowerCase().includes(needle);
}

export function ProductDesk({
  products,
  initialQuery,
  initialStatus,
}: {
  products: CatalogProduct[];
  initialQuery: string;
  initialStatus: "all" | StockState;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const unsized = products
    .filter((product) => product.variants.length === 0 && matchesName(product, query))
    .sort((a, b) => a.name.localeCompare(b.name));
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
    .filter((row) => matchesName(row.product, query))
    .sort((a, b) => a.product.name.localeCompare(b.product.name) || (a.variant.sizeMl ?? 0) - (b.variant.sizeMl ?? 0));

  return (
    <>
      <p className="mt-1 text-sm text-taupe">
        {rows.length} {rows.length === 1 ? "size" : "sizes"}. Untracked bottles stay for sale until you set opening stock.
      </p>
      <div className="mt-6">
        <label className="sr-only" htmlFor="product-search">
          Search by name or brand
        </label>
        <input
          id="product-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or brand"
          autoComplete="off"
          className="h-11 w-full border border-espresso/15 px-3 text-sm sm:max-w-xs"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = status === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3 text-sm",
                active ? "bg-espresso text-ivory" : "border border-espresso/10 bg-white text-espresso",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {status === "all" && unsized.length ? (
        <div className="mt-6 rounded-[1.25rem] border border-espresso/10 bg-white p-4">
          <h2 className="font-medium">Waiting for a size and price</h2>
          <p className="mt-1 text-sm text-taupe">These bottles are not on the shop yet. Add a size and a price, then publish.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {unsized.map((product) => {
              const image = primaryImage(product);
              return (
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden bg-espresso/5">
                      {image ? <Image src={image.url} alt="" fill className="object-cover" sizes="56px" /> : null}
                    </span>
                    <span>
                      <span className="block font-medium">{product.name}</span>
                      <span className="block text-sm text-taupe">{product.brand}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <ul className="mt-6 space-y-3 lg:hidden">
        {rows.map((row) => (
          <li key={row.variant.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-3">
            <div className="flex gap-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-espresso/5">
                {row.image ? <Image src={row.image.url} alt={row.product.name} fill className="object-cover" sizes="64px" /> : null}
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
                    {row.image ? <Image src={row.image.url} alt={row.product.name} fill className="object-cover" sizes="48px" /> : null}
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
    </>
  );
}
