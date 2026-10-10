import Image from "next/image";
import Link from "next/link";
import { BrandGrid } from "@/components/brand/brand-grid";
import { NewsletterForm } from "@/components/layout/newsletter-form";
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
      <section className="relative overflow-hidden bg-rich">
        <div className="relative mx-auto min-h-[70vh] w-full max-w-[1600px]">
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
          <div className="absolute inset-0 bg-gradient-to-r from-rich/25 via-transparent to-transparent" />
        </div>
      </section>

      <section className="px-4 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-champagne">Ghana boutique</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">Welcome to EllzLuxe Fragranz</h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-xl italic text-taupe">
          Fragrance as a private signature.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "gold" }), "mt-8 inline-flex rounded-full")}>
          View all perfumes
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl underline decoration-champagne decoration-2 underline-offset-8">
            New arrivals
          </h2>
          <Link href="/shop?sort=newest" className="text-xs uppercase tracking-[0.2em]">
            Shop all
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={arrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-serif text-4xl">Shop by collection</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shopBy.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative min-h-64 overflow-hidden"
            >
              <Image
                src={collection.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-rich/45" />
              <span className="absolute inset-x-4 bottom-5 text-center font-serif text-3xl text-ivory">
                {collection.name.replace(" fragrances", "")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <BrandGrid />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-serif text-4xl">Best-selling</h2>
        <p className="mt-2 text-sm text-taupe">Featured compositions from the current catalog.</p>
        <div className="mt-10">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="my-8 grid min-h-[24rem] bg-espresso text-ivory md:grid-cols-2">
        <div className="relative min-h-72">
          <Image src="/images/story.jpg" alt="Warm still life of perfume bottles" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Our story</p>
          <h2 className="mt-3 font-serif text-4xl">A boutique for personal scent.</h2>
          <p className="mt-6 max-w-md leading-7 text-ivory/75">{settings.aboutStory}</p>
          <Link href="/about" className={cn(buttonVariants({ variant: "gold" }), "mt-8 w-fit")}>
            Read the story
          </Link>
        </div>
      </section>

      <section className="mx-auto my-16 max-w-3xl px-4 py-12 text-center">
        <h2 className="font-serif text-4xl">Notes from the house</h2>
        <p className="mt-4 text-taupe">
          Occasional letters on new compositions and seasonal edits.
        </p>
        <NewsletterForm />
      </section>
    </>
  );
}
