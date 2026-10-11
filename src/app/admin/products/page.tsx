import Image from "next/image";
import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { formatMoney } from "@/lib/money";
import { lowestPrice, primaryImage, totalStock } from "@/lib/catalog/helpers";
import { StatusPill } from "@/components/admin/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products · Admin" };

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl">Products</h1>
          <p className="mt-2 text-sm text-taupe">{products.length} records · uncheck demonstration when a bottle is live.</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "gold", size: "sm" }))}>
          New product
        </Link>
      </div>
      <div className="luxe-panel mt-8 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-[11px] uppercase tracking-[0.16em] text-taupe">
              <th className="px-4 py-3">Bottle</th>
              <th>Status</th>
              <th>Kind</th>
              <th>Stock</th>
              <th>From</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = primaryImage(product);
              return (
                <tr key={product.id} className="border-b border-espresso/10 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 overflow-hidden bg-espresso/5">
                        {image ? (
                          <Image src={image.url} alt="" fill className="object-cover" sizes="48px" />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-medium">{product.name}</span>
                        <span className="text-taupe">{product.brand}</span>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <StatusPill value={product.status} />
                  </td>
                  <td>
                    <StatusPill value={product.isDemonstration ? "demonstration" : "live"} />
                  </td>
                  <td>{totalStock(product)}</td>
                  <td>{formatMoney(lowestPrice(product))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
