import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

export function BrandGrid() {
  return (
    <section className="border-t border-espresso/10 bg-white px-4 py-12" aria-label="Brands">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">Brands</h2>
          <Link href="/brands" className="inline-flex min-h-11 shrink-0 items-center text-sm text-taupe hover:text-espresso">
            All brands
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {HOUSE_BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/brands/${brand.slug}`}
                className="flex h-20 items-center justify-center border border-espresso/10 bg-ivory px-3"
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={140}
                    height={56}
                    unoptimized
                    className="h-10 w-auto max-w-full object-contain"
                  />
                ) : (
                  <span className="text-center text-sm text-espresso">{brand.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
