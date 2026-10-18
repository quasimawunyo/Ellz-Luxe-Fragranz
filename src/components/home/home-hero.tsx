"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/images/hero.jpg", label: "A bottle spraying perfume" },
  { src: "/images/story.jpg", label: "Two perfume bottles on linen" },
  { src: "/images/discovery.jpg", label: "A row of perfume bottles in daylight" },
] as const;

export function HomeHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [index]);

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-rich text-snow" aria-roledescription="carousel" aria-label="EllzLuxe Fragranz">
      {SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <div
            key={slide.src}
            className={cn("absolute inset-0 transition-opacity duration-700", active ? "opacity-100" : "opacity-0")}
            aria-hidden={!active}
          >
            <Image
              src={slide.src}
              alt={active ? slide.label : ""}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,24,20,0.78)_0%,rgba(18,24,20,0.5)_58%,rgba(18,24,20,0.32)_100%)]" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-serif text-2xl italic text-snow [text-shadow:0_2px_16px_rgba(18,24,20,0.55)] sm:text-3xl">Welcome to</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight [text-shadow:0_2px_18px_rgba(18,24,20,0.55)] sm:text-6xl md:text-7xl">
          <span className="text-snow">Ellz</span>
          <span className="italic text-[#f6e7b2]">Luxe</span> <span className="text-[#e7f6ee]">Fragranz</span>
        </h1>
        <p className="mt-5 font-serif text-xl italic tracking-wide text-[#f7f1df] [text-shadow:0_2px_16px_rgba(18,24,20,0.55)] sm:text-2xl">
          Your scent. Your signature.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className={buttonVariants({ variant: "solid" })}>
            Shop
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "ghostOnDark" })}>
            About
          </Link>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
        {SLIDES.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <button
              key={slide.src}
              type="button"
              aria-label={`Photo ${slideIndex + 1}`}
              aria-current={active ? "true" : undefined}
              onClick={() => setIndex(slideIndex)}
              className={cn("h-1.5 rounded-full", active ? "w-8 bg-champagne" : "w-3 bg-snow/50")}
            />
          );
        })}
      </div>
    </section>
  );
}
