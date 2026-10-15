import Image from "next/image";
import Link from "next/link";
import { BrandGrid } from "@/components/brand/brand-grid";
import { FactTicker } from "@/components/home/fact-ticker";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getCollections, getFeaturedProducts, getNewArrivals, getStoreSettings } from "@/lib/catalog/queries";
import { cn } from "@/lib/utils";
import { formatGhanaPhone } from "@/lib/whatsapp";

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
      <BrandGrid />

      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl">Collections</h2>
            <Link href="/collections" className="hidden text-sm text-taupe hover:text-espresso sm:inline">
              All collections
            </Link>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shopBy.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative min-h-[22rem] overflow-hidden"
              >
                <Image src={collection.imageUrl} alt="" fill className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-rich/65 via-rich/10 to-transparent" />
                <span className="absolute inset-x-5 bottom-6 font-serif text-3xl leading-tight text-ivory">
                  {collection.name.replace(" fragrances", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl md:text-5xl">New arrivals</h2>
            <Link href="/new" className="text-sm text-taupe hover:text-espresso">
              View all
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={arrivals} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl">Featured</h2>
              <p className="mt-3 max-w-md text-taupe">Picks from the current shelf.</p>
            </div>
            <Link href="/shop" className="hidden text-sm text-taupe hover:text-espresso sm:inline">
              View all products
            </Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} />
          </div>
        </div>
      </section>

      <section className="border-y border-espresso/10 bg-white px-4 py-16">
        <h2 className="sr-only">Pickup, delivery, and WhatsApp</h2>
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-espresso/10">
          <div className="md:px-10">
            <p className="font-serif text-2xl">Pickup</p>
            <p className="mt-3 text-sm leading-6 text-taupe">Free at {settings.location.trim()}.</p>
          </div>
          <div className="md:px-10">
            <p className="font-serif text-2xl">Delivery</p>
            <p className="mt-3 text-sm leading-6 text-taupe">24–72 hours. Quoted on WhatsApp from your location.</p>
          </div>
          <div className="md:px-10">
            <p className="font-serif text-2xl">WhatsApp</p>
            <p className="mt-3 text-sm leading-6 text-taupe">
              {settings.contactPhone ? formatGhanaPhone(settings.contactPhone) : "Message us."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid min-h-[24rem] bg-rich text-ivory md:grid-cols-2">
        <div className="relative min-h-80">
          <Image src="/images/story.jpg" alt="Warm still life of perfume bottles" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-ivory/50">Our story</p>
          <h2 className="mt-3 font-serif text-4xl">About</h2>
          <p className="mt-6 max-w-md leading-7 text-ivory/75">{settings.aboutStory}</p>
          <Link href="/about" className={cn(buttonVariants({ variant: "solid" }), "mt-8 inline-flex w-fit")}>
            About us
          </Link>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
