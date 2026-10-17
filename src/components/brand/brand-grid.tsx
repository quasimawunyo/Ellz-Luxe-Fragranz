import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

export function BrandGrid() {
  return (
    <section className="bg-leaf" aria-label="Brands">
      <p className="pt-3 text-center text-[10px] uppercase tracking-[0.4em] text-champagne sm:text-xs">Brands</p>
      <div className="overflow-hidden">
        <div className="brand-marquee-track flex w-max items-center gap-6 py-4 sm:gap-10 sm:py-5">
          {LOOP.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/brands/${brand.slug}`}
              aria-label={brand.name}
              className="flex h-16 w-40 shrink-0 items-center justify-center rounded-2xl bg-ivory px-4 sm:h-20 sm:w-48"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt=""
                  width={180}
                  height={72}
                  unoptimized
                  className="h-12 w-auto max-w-full object-contain sm:h-14"
                />
              ) : (
                <span className="text-center font-serif text-lg leading-tight text-espresso sm:text-xl">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
