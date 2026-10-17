import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { cn } from "@/lib/utils";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

const NAME_STYLES = [
  "font-serif text-2xl italic text-snow sm:text-3xl",
  "text-sm font-semibold uppercase tracking-[0.38em] text-champagne sm:text-base",
  "font-serif text-3xl text-snow sm:text-4xl",
  "text-lg font-medium uppercase tracking-[0.22em] text-champagne",
];

export function BrandGrid() {
  return (
    <section className="bg-leaf" aria-label="Brands">
      <p className="pt-5 text-center text-[11px] uppercase tracking-[0.48em] text-champagne">Brands</p>
      <div className="overflow-hidden">
        <div className="brand-marquee-track flex w-max items-center py-6 sm:py-8">
          {LOOP.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/brands/${brand.slug}`}
              className={cn("mx-8 shrink-0 whitespace-nowrap sm:mx-12", NAME_STYLES[index % NAME_STYLES.length])}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
