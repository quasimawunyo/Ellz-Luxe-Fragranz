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

      <section className="px-4 py-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">EllzLuxe Fragranz</h1>
        <p className="mx-auto mt-4 max-w-md text-taupe">Perfume boutique at Ells Luxe Annex, Ghana.</p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "gold" }), "mt-8 inline-flex")}>
          Shop now
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">New arrivals</h2>
          <Link href="/shop?sort=newest" className="text-sm text-taupe hover:text-espresso">
            Shop all
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={arrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl">Shop by collection</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-rich/40" />
              <span className="absolute inset-x-4 bottom-5 text-center font-serif text-2xl text-ivory">
                {collection.name.replace(" fragrances", "")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <BrandGrid />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-serif text-3xl">Best sellers</h2>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="my-8 grid min-h-[24rem] bg-espresso text-ivory md:grid-cols-2">
        <div className="relative min-h-72">
          <Image src="/images/story.jpg" alt="Warm still life of perfume bottles" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <h2 className="font-serif text-3xl">About</h2>
          <p className="mt-6 max-w-md leading-7 text-ivory/75">{settings.aboutStory}</p>
          <Link href="/about" className={cn(buttonVariants({ variant: "gold" }), "mt-8 w-fit")}>
            Read more
          </Link>
        </div>
      </section>

      <section className="mx-auto my-16 max-w-3xl px-4 py-8 text-center">
        <h2 className="font-serif text-3xl">Email updates</h2>
        <p className="mt-3 text-taupe">New arrivals and restocks.</p>
        <NewsletterForm />
      </section>
    </>
  );
}
