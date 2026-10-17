import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { cn } from "@/lib/utils";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

const NAME_STYLES = [
  "font-serif text-lg italic text-snow sm:text-xl",
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-champagne sm:text-sm",
  "font-serif text-xl text-snow sm:text-2xl",
  "text-sm font-medium uppercase tracking-[0.16em] text-champagne sm:text-base",
];

export function BrandGrid() {
  return (
    <section className="bg-leaf" aria-label="Brands">
      <p className="pt-2 text-center text-[10px] uppercase tracking-[0.32em] text-champagne">Brands</p>
      <div className="overflow-hidden">
        <div className="brand-marquee-track flex w-max items-center py-2.5 sm:py-3">
          {LOOP.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/brands/${brand.slug}`}
              className={cn("mx-5 shrink-0 whitespace-nowrap sm:mx-8", NAME_STYLES[index % NAME_STYLES.length])}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
