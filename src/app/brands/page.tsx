import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandGrid } from "@/components/brand/brand-grid";

export const metadata = { title: "Our Brands" };

export default function BrandsPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Brands" }]} />
      </div>
      <BrandGrid />
    </div>
  );
}
