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
  const categoryOrder = ["col-women", "col-men", "col-unisex", "col-gifts"];
  const shopBy = categoryOrder.flatMap((id) => collections.filter((collection) => collection.id === id));
  const flash = picturesForFlashSales(discounted, discounted.length);

  return (
    <>
      <HomeHero />
      <HeroAnnouncement location={settings.location} phone={settings.contactPhone} />

      <section className="bg-white px-4 pb-14 pt-14" aria-label="New arrivals">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-4xl md:text-5xl">New arrivals</h2>
          {arrivals.length ? (
            <div className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
              {arrivals.map((product) => (
                <div key={product.id} className="w-64 shrink-0 snap-start sm:w-72">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-ivory px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl md:text-4xl">Shop by category</h2>
            <Link href="/collections" className="inline-flex min-h-11 shrink-0 items-center text-sm text-taupe hover:text-espresso">
              All categories
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 lg:grid-cols-4">
            {shopBy.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                prefetch
                className="group relative aspect-[3/2] min-w-0 overflow-hidden rounded-2xl sm:aspect-[4/3] lg:rounded-[1.5rem]"
              >
                <Image
                  src={collection.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rich/75 via-rich/20 to-transparent" />
                <span className="absolute inset-x-2.5 bottom-2.5 font-serif text-base leading-tight text-snow sm:inset-x-4 sm:bottom-4 sm:text-xl">
                  {collection.name.replace(" fragrances", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-4xl md:text-5xl">Best sellers</h2>
          <div className="mt-10">
            <ProductGrid products={featured} viewAllHref="/shop" className="grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:gap-y-12" />
          </div>
        </div>
      </section>

      {flash.length ? (
        <section className="bg-white px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-4xl md:text-5xl">Flash sales</h2>
              <Link href="/sale" className="shrink-0 text-sm text-taupe hover:text-espresso">
                View all
              </Link>
            </div>
            <div className="mt-8">
              <FlashSales products={flash} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-14">
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
            <Link href="/about" className={cn(buttonVariants({ variant: "shop" }), "mt-8 inline-flex w-fit px-8")}>
              About us
            </Link>
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
