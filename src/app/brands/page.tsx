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
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-5">
        {HOUSE_BRANDS.map((brand) => (
          <li key={brand.slug}>
            <Link href={`/brands/${brand.slug}`} className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-espresso/10 bg-ivory px-3 py-5 text-center">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt=""
                  width={180}
                  height={72}
                  unoptimized
                  className="h-12 w-auto max-w-full object-contain sm:h-16"
                />
              ) : null}
              <span className={brand.logo ? "text-sm" : "font-serif text-xl leading-tight"}>{brand.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
