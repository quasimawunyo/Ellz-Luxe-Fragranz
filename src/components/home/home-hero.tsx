import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHero() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:gap-12 md:py-14">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-espresso sm:text-5xl">EllzLuxe Fragranz</h1>
          <p className="mt-4 max-w-md text-lg text-taupe">Your scent. Your signature.</p>
          <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "mt-8 inline-flex px-8")}>
            Shop
          </Link>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden bg-espresso/5">
          <Image
            src="/images/hero.jpg"
            alt="A bottle spraying perfume"
            fill
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
