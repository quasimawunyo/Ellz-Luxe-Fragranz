import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";
import { cn } from "@/lib/utils";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

const NAME_STYLES = [
  "font-serif text-base italic text-snow sm:text-lg",
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne sm:text-xs",
  "font-serif text-lg text-snow sm:text-xl",
  "text-xs font-medium uppercase tracking-[0.14em] text-champagne sm:text-sm",
];

export function BrandGrid() {
  return (
    <section className="bg-leaf" aria-label="Brands">
      <p className="pt-1.5 text-center text-[9px] uppercase tracking-[0.28em] text-champagne">Brands</p>
      <div className="overflow-hidden">
        <div className="brand-marquee-track flex w-max items-center py-2 sm:py-2.5">
          {LOOP.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/brands/${brand.slug}`}
              className={cn("mx-4 shrink-0 whitespace-nowrap sm:mx-6", NAME_STYLES[index % NAME_STYLES.length])}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
