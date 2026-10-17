import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { cn } from "@/lib/utils";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

const NAME_STYLES = [
  "font-serif text-4xl italic text-snow sm:text-5xl",
  "text-xl font-semibold uppercase tracking-[0.32em] text-champagne sm:text-2xl",
  "font-serif text-5xl text-snow sm:text-6xl",
  "text-2xl font-medium uppercase tracking-[0.2em] text-champagne sm:text-3xl",
];

export function BrandGrid() {
  return (
    <section className="bg-leaf" aria-label="Brands">
      <p className="pt-6 text-center text-xs uppercase tracking-[0.48em] text-champagne sm:text-sm">Brands</p>
      <div className="overflow-hidden">
        <div className="brand-marquee-track flex w-max items-center py-8 sm:py-10">
          {LOOP.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/brands/${brand.slug}`}
              className={cn("mx-10 shrink-0 whitespace-nowrap sm:mx-14", NAME_STYLES[index % NAME_STYLES.length])}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
