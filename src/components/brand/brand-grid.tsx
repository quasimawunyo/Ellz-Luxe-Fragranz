import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

export function BrandGrid() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-serif text-4xl text-espresso underline decoration-espresso decoration-2 underline-offset-8">
          Our Brands
        </h2>
        <ul className="mt-12 grid grid-cols-2 items-center gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {HOUSE_BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/brands/${brand.slug}`}
                aria-label={brand.name}
                className="flex min-h-28 items-center justify-center px-2 transition-opacity hover:opacity-70"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={220}
                  height={220}
                  unoptimized
                  className="h-24 w-auto max-w-full object-contain"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
