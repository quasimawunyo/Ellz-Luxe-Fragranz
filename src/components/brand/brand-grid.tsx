import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

export function BrandGrid() {
  return (
    <section className="bg-ivory px-4 py-20" aria-label="Brands">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl md:text-5xl">Brands</h2>
          <Link href="/brands" className="text-sm text-taupe hover:text-espresso">
            View all
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {HOUSE_BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/brands/${brand.slug}`}
                className="flex h-full flex-col items-center justify-center gap-4 bg-white px-4 py-10 transition-colors hover:bg-white/70"
              >
                <Image
                  src={brand.logo}
                  alt=""
                  width={200}
                  height={80}
                  unoptimized
                  className="h-14 w-auto max-w-[9rem] object-contain sm:h-16"
                />
                <span className="text-center text-sm">{brand.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
