import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FlashSales, picturesForFlashSales } from "@/components/home/flash-sales";
import { buttonVariants } from "@/components/ui/button";
import { isDiscounted } from "@/lib/catalog/helpers";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Flash sales" };

export default async function SalePage() {
  const discounted = (await getPublishedProducts()).filter(isDiscounted);
  const products = picturesForFlashSales(discounted, discounted.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Flash sales" }]} />
      <h1 className="mt-8 font-serif text-4xl">Flash sales</h1>
      {products.length ? (
        <div className="mt-10">
          <FlashSales products={products} />
        </div>
      ) : (
        <div className="mt-10">
          <p className="text-taupe">No bottles are on sale right now.</p>
          <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "mt-8 inline-flex px-8")}>
            Shop
          </Link>
        </div>
      )}
    </div>
  );
}
