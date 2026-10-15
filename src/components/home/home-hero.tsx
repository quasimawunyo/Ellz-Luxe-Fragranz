import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHero({ location }: { location: string }) {
  const place = location.trim();
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-rich text-ivory" aria-label="Featured">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero.jpg"
        aria-label="EllzLuxe Fragranz campaign film"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-rich/80 via-rich/30 to-rich/15" />
      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-6 py-28 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-ivory/70">Ells Luxe Annex, Pantang</p>
        <h1 className="mt-6 font-serif text-5xl leading-[0.95] sm:text-7xl md:text-[5.25rem]">
          EllzLuxe <span className="font-light italic text-champagne">Fragranz</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-ivory/80 sm:text-lg">
          Perfume boutique at {place}.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link href="/shop" className={cn(buttonVariants({ variant: "solid" }), "gap-3")}>
            Shop
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <Link href="/about" className={cn(buttonVariants({ variant: "ghostOnDark" }))}>
            About
          </Link>
        </div>
      </div>
    </section>
  );
}
