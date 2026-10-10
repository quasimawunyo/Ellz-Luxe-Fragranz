import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandGrid } from "@/components/brand/brand-grid";

export const metadata = { title: "Our Brands" };

export default function BrandsPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Brands" }]} />
        <h1 className="mt-6 font-serif text-5xl">Our Brands</h1>
        <p className="mt-3 max-w-xl text-taupe">
          Houses carried at Ells Luxe Annex. Open a mark to see tagged demonstration bottles.
        </p>
      </div>
      <div className="mt-10">
        <BrandGrid />
      </div>
    </div>
  );
}
