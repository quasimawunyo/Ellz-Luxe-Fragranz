import Link from "next/link";
import { ProductDesk } from "@/components/admin/product-desk";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { type StockState } from "@/lib/stock";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit products · Shop desk" };

const STATUSES = ["all", "in_stock", "low_stock", "out_of_stock", "not_tracked"] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status as (typeof STATUSES)[number]) ? (params.status as "all" | StockState) : "all";
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
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

      <ProductDesk products={products} initialQuery={params.q ?? ""} initialStatus={status} />
    </div>
  );
}
