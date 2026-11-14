import Link from "next/link";
import { loadSalesSummary } from "@/lib/admin/summary";

export const metadata = { title: "Stock · Shop desk" };

export default async function StockPage() {
  const summary = await loadSalesSummary("7d");
  const stock = summary.stock;
  const cards = [
    ["Every size", stock.sizes, "/admin/products"],
    ["In stock", stock.inStock, "/admin/products?status=in_stock"],
    ["Low stock", stock.lowStock, "/admin/products?status=low_stock"],
    ["Out of stock", stock.outOfStock, "/admin/products?status=out_of_stock"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Stock</h1>
          <p className="mt-2 text-sm text-taupe">Tracked sizes only. Untracked bottles stay for sale until you set opening stock.</p>
        </div>
        <Link href="/admin/products/opening" className="inline-flex min-h-11 items-center rounded-full bg-espresso px-4 text-sm text-ivory">
          Set opening stock
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-[1.25rem] border border-espresso/10 bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-taupe">{label}</p>
            <p className="mt-3 font-serif text-3xl">{value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <h2 className="font-serif text-2xl">Low stock</h2>
        {stock.low.length ? (
          <ul className="mt-4 space-y-3 text-sm">
            {stock.low.map((row) => (
              <li key={row.variantId} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {row.productName} · {row.label} · {row.quantity} left
                </span>
                <Link href={`/admin/products/stock/${row.variantId}`} className="inline-flex min-h-11 items-center text-leaf underline underline-offset-4">
                  Adjust stock
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-taupe">No tracked sizes are low.</p>
        )}
      </section>
      <section className="mt-4 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <h2 className="font-serif text-2xl">No photo</h2>
        <p className="mt-1 text-sm text-taupe">{stock.noPhotoCount} {stock.noPhotoCount === 1 ? "product" : "products"}</p>
        {stock.noPhoto.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {stock.noPhoto.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-taupe">Every product has a photo.</p>
        )}
      </section>
    </div>
  );
}
