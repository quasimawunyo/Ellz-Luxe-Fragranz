import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

export function BrandGrid() {
  return (
    <section className="border-y border-espresso/10 bg-ivory" aria-label="Brands">
      <div className="flex items-stretch">
        <p className="hidden shrink-0 items-center border-r border-espresso/10 px-5 text-sm text-espresso sm:flex">
          Brands
        </p>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="px-4 pt-3 text-center text-sm sm:hidden">Brands</p>
          <div className="brand-marquee-track flex w-max items-center py-7">
            {LOOP.map((brand, index) => (
              <Link
                key={`${brand.slug}-${index}`}
                href={`/brands/${brand.slug}`}
                aria-label={brand.name}
                className="mx-10 flex h-20 shrink-0 items-center justify-center sm:mx-14 sm:h-24"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={280}
                  height={112}
                  unoptimized
                  className="h-16 w-auto max-w-56 object-contain sm:h-20"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
