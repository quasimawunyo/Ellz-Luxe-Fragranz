import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

export function BrandGrid() {
  return (
    <section className="border-y border-espresso/10 bg-white" aria-label="Brands">
      <div className="flex items-stretch">
        <p className="hidden shrink-0 items-center border-r border-espresso/10 px-5 text-sm text-espresso sm:flex">
          Brands
        </p>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="px-4 pt-3 text-center text-sm sm:hidden">Brands</p>
          <div className="brand-marquee-track flex w-max items-center py-4">
            {LOOP.map((brand, index) => (
              <Link
                key={`${brand.slug}-${index}`}
                href={`/brands/${brand.slug}`}
                aria-label={brand.name}
                className="mx-8 flex h-12 shrink-0 items-center justify-center sm:mx-10"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={180}
                  height={72}
                  unoptimized
                  className="h-10 w-auto max-w-40 object-contain sm:h-12"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
