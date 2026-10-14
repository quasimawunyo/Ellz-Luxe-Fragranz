"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    kind: "video" as const,
    src: "/videos/hero.mp4",
    poster: "/images/hero.jpg",
    eyebrow: "Welcome to the annex",
    title: "EllzLuxe",
    accent: "Fragranz",
    body: (location: string) => `Perfume boutique at ${location}.`,
    primary: { href: "/shop", label: "Shop" },
    secondary: { href: "/about", label: "About the annex" },
  },
  {
    kind: "image" as const,
    src: "/images/story.jpg",
    eyebrow: "Women · Men · Unisex",
    title: "Find your",
    accent: "scent",
    body: () => "Shop by collection, or message the annex if you want help choosing a bottle.",
    primary: { href: "/collections", label: "Shop collections" },
    secondary: { href: "/shop", label: "All perfumes" },
  },
  {
    kind: "image" as const,
    src: "/images/discovery.jpg",
    eyebrow: "Houses we carry",
    title: "Bottles worth",
    accent: "trying",
    body: () => "Testers are marked Tester. Confirm the bottle before you pay.",
    primary: { href: "/brands", label: "Shop brands" },
    secondary: { href: "/new", label: "New arrivals" },
  },
];

export function HomeHero({ location }: { location: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-rich text-ivory" aria-label="Featured">
      {SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <div
            key={slide.eyebrow}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={!active}
          >
            {slide.kind === "video" ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={slide.poster}
                aria-label="EllzLuxe Fragranz campaign film"
              >
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <Image src={slide.src} alt="" fill sizes="100vw" priority={slideIndex === 0} className="object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-rich/80 via-rich/35 to-rich/20" />
          </div>
        );
      })}

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-6 py-28 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-ivory/80">
          — {SLIDES[index].eyebrow} —
        </p>
        <h1 className="mt-6 font-serif text-4xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          {SLIDES[index].title}{" "}
          <span className="bg-gradient-to-r from-champagne to-amber-100 bg-clip-text font-light italic text-transparent">
            {SLIDES[index].accent}
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-ivory/80 sm:text-lg">
          {SLIDES[index].body(location)}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href={SLIDES[index].primary.href} className={cn(buttonVariants({ variant: "solid" }), "gap-3")}>
            {SLIDES[index].primary.label}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <Link href={SLIDES[index].secondary.href} className={cn(buttonVariants({ variant: "ghostOnDark" }), "gap-2")}>
            {SLIDES[index].secondary.label}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2">
        {SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.eyebrow}
            type="button"
            aria-label={`Go to slide ${slideIndex + 1}`}
            onClick={() => setIndex(slideIndex)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              slideIndex === index ? "w-8 bg-ivory" : "w-3 bg-ivory/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
