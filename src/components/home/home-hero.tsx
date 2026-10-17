import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-rich text-snow" aria-label="EllzLuxe Fragranz">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-rich/50" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-5xl leading-tight sm:text-6xl md:text-7xl">EllzLuxe Fragranz</h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className={buttonVariants({ variant: "solid" })}>
            Shop
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "ghostOnDark" })}>
            About
          </Link>
        </div>
      </div>
    </section>
  );
}
