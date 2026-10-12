import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

export const metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Brands" }]} />
      <h1 className="mt-6 font-serif text-4xl">Brands</h1>
      <p className="mt-3 max-w-xl text-taupe">Stocked at Ells Luxe Annex.</p>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {HOUSE_BRANDS.map((brand) => (
          <li key={brand.slug}>
            <Link href={`/brands/${brand.slug}`} className="flex flex-col items-center gap-3 border border-espresso/10 bg-white px-4 py-8">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={180}
                height={72}
                unoptimized
                className="h-16 w-auto max-w-52 object-contain"
              />
              <span className="text-sm">{brand.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
