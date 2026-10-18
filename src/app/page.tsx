import Image from "next/image";
import Link from "next/link";
import { FlashSales, picturesForFlashSales } from "@/components/home/flash-sales";
import { HeroAnnouncement } from "@/components/home/hero-announcement";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getCollections, getDiscountedProducts, getFeaturedProducts, getNewArrivals, getStoreSettings } from "@/lib/catalog/queries";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featured, discounted, arrivals, collections, settings] = await Promise.all([
    getFeaturedProducts(),
    getDiscountedProducts(),
    getNewArrivals(),
    getCollections(),
    getStoreSettings(),
  ]);
  const shopBy = collections.filter((collection) =>
    ["col-women", "col-men", "col-unisex", "col-gifts"].includes(collection.id),
  );
  const flash = picturesForFlashSales(
    discounted.length ? discounted : [...featured, ...arrivals],
    discounted.length ? discounted.length : 4,
  );

  return (
    <>
      <HomeHero />
      <HeroAnnouncement location={settings.location} phone={settings.contactPhone} />
      <div className="bg-white px-4 pb-2 pt-8 text-center">
        <Link href="/shop" className={cn(buttonVariants({ variant: "shop" }), "px-8")}>
          View all perfumes
        </Link>
      </div>

      <section className="overflow-hidden bg-white pb-20 pt-6" aria-label="New arrivals">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-serif text-4xl md:text-5xl">New arrivals</h2>
        </div>
        {arrivals.length ? (
          <div className="mt-10 overflow-hidden">
            <div className="flex w-max animate-brand-marquee gap-6 px-4 hover:[animation-play-state:paused]">
              {[...arrivals, ...arrivals].map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-64 shrink-0 sm:w-72"
                  aria-hidden={index >= arrivals.length}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="bg-ivory px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-4xl md:text-5xl">Best sellers</h2>
          <div className="mt-10">
            <ProductGrid products={featured} viewAllHref="/shop" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl">Flash sales</h2>
            <Link href="/sale" className="shrink-0 text-sm text-taupe hover:text-espresso">
              View all
            </Link>
          </div>
          <div className="mt-10">
            <FlashSales products={flash} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl">Shop by category</h2>
            <Link href="/collections" className="shrink-0 text-sm text-taupe hover:text-espresso">
              All categories
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shopBy.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative min-h-80 overflow-hidden rounded-[1.75rem]"
              >
                <Image
                  src={collection.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rich/70 via-rich/10 to-transparent" />
                <span className="absolute inset-x-5 bottom-6 font-serif text-3xl leading-tight text-snow">
                  {collection.name.replace(" fragrances", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto grid min-h-[24rem] max-w-7xl overflow-hidden rounded-[2rem] bg-rich text-snow md:grid-cols-2">
          <div className="relative min-h-80">
            <Image
              src="/images/story.jpg"
              alt="Perfume bottles"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-8 py-16 md:px-16">
            <h2 className="font-serif text-4xl">About</h2>
            <p className="mt-6 max-w-md leading-7 text-snow/75">{settings.aboutStory}</p>
            <Link href="/about" className={cn(buttonVariants({ variant: "gold" }), "mt-8 inline-flex w-fit")}>
              About us
            </Link>
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
