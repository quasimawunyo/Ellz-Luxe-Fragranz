import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FactTicker } from "@/components/home/fact-ticker";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getCollections, getFeaturedProducts, getNewArrivals, getStoreSettings } from "@/lib/catalog/queries";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featured, arrivals, collections, settings] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCollections(),
    getStoreSettings(),
  ]);
  const shopBy = collections.filter((collection) =>
    ["col-women", "col-men", "col-unisex", "col-gifts"].includes(collection.id),
  );

  return (
    <>
      <HomeHero location={settings.location} />
      <FactTicker />

      <section className="bg-ivory px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.42em] text-taupe">Handpicked</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl">Featured products</h2>
              <p className="mt-3 max-w-md text-taupe">Top picks from the boutique.</p>
            </div>
            <Link href="/shop" className="shrink-0 text-sm text-taupe hover:text-espresso">
              View all products
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} viewAllHref="/shop" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-[11px] uppercase tracking-[0.42em] text-taupe">— Collections —</p>
          <div className="mt-4 flex items-end justify-between gap-4">
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

      <section className="bg-ivory px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.42em] text-taupe">New arrivals</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl">Fresh bottles</h2>
            <Link href="/new" className="text-sm text-taupe hover:text-espresso">
              View all
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={arrivals} />
          </div>
        </div>
      </section>

      <section className="grid min-h-[24rem] bg-rich text-snow md:grid-cols-2">
        <div className="relative min-h-80">
          <Image
            src="/images/story.jpg"
            alt="Warm still life of perfume bottles"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-snow/50">Our story</p>
          <h2 className="mt-3 font-serif text-4xl">About</h2>
          <p className="mt-6 max-w-md leading-7 text-snow/75">{settings.aboutStory}</p>
          <Link href="/about" className={cn(buttonVariants({ variant: "gold" }), "mt-8 inline-flex w-fit items-center gap-2")}>
            About us
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
