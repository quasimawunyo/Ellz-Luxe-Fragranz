import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { formatMoney } from "@/lib/money";
import { lowestPrice } from "@/lib/catalog/helpers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products · Admin" };

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Products</h1>
        <Link href="/admin/products/new" className={cn(buttonVariants({ size: "sm" }))}>
          New product
        </Link>
      </div>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-widest text-taupe">
            <th className="py-3">Name</th>
            <th>Status</th>
            <th>Live / demo</th>
            <th>From</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-espresso/10">
              <td className="py-3">
                <Link href={`/admin/products/${product.id}`}>{product.name}</Link>
              </td>
              <td>{product.status}</td>
              <td>{product.isDemonstration ? "Demonstration" : "Live"}</td>
              <td>{formatMoney(lowestPrice(product))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
