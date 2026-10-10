import Image from "next/image";
import Link from "next/link";
import { HOUSE_BRANDS } from "@/lib/catalog/brands";

const LOOP = [...HOUSE_BRANDS, ...HOUSE_BRANDS];

export function BrandGrid() {
  return (
    <section className="border-y border-espresso/10 bg-white" aria-label="Our brands">
      <style>{`
        @keyframes brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .brand-marquee-track {
          animation: brand-marquee 40s linear infinite;
        }
        .brand-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-track {
            animation: none;
          }
        }
      `}</style>
      <div className="flex items-stretch">
        <p className="hidden shrink-0 items-center border-r border-espresso/10 px-5 font-serif text-lg text-espresso sm:flex">
          Our Brands
        </p>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="px-4 pt-3 text-center font-serif text-lg sm:hidden">Our Brands</p>
          <div className="brand-marquee-track flex w-max animate-brand-marquee items-center py-4 hover:[animation-play-state:paused]">
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
