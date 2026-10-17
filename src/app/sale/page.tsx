import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FlashSales, picturesForFlashSales } from "@/components/home/flash-sales";
import { isDiscounted } from "@/lib/catalog/helpers";
import { getPublishedProducts } from "@/lib/catalog/queries";

export const metadata = { title: "Flash sales" };

export default async function SalePage() {
  const published = await getPublishedProducts();
  const discounted = published.filter(isDiscounted);
  const products = picturesForFlashSales(discounted.length ? discounted : published, discounted.length ? discounted.length : 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Flash sales" }]} />
      <h1 className="mt-8 font-serif text-4xl">Flash sales</h1>
      <p className="mt-3 max-w-xl text-taupe">Bottles at Ells Luxe Annex.</p>
      <div className="mt-10">
        <FlashSales products={products} />
      </div>
    </div>
  );
}
