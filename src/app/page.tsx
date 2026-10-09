import Image from "next/image";
import Link from "next/link";
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
  const highlights = collections.filter((collection) =>
    ["col-women", "col-men", "col-oud", "col-gifts"].includes(collection.id),
  );

  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden bg-rich">
        <Image
          src="/images/story.jpg"
          alt="Editorial still of a glass perfume bottle in warm light"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-rich/80 via-rich/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-end px-4 py-20">
          <div className="max-w-xl text-ivory">
            <p className="text-xs uppercase tracking-[0.28em] text-champagne">Ellz Luxe Fragranz</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-7xl">
              Fragrance as a private signature.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-ivory/80">
              Discover compositions that feel considered — citrus air, floral quiet, resinous night — composed for personality rather than spectacle.
            </p>
            <Link href="/shop" className={cn(buttonVariants({ variant: "gold" }), "mt-8 inline-flex")}>
              Shop now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-taupe">Collections</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">Find your family</h2>
          </div>
          <Link href="/collections" className="hidden text-xs uppercase tracking-[0.2em] md:inline">
            View all
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {highlights.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative min-h-72 overflow-hidden">
              <Image
                src={collection.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-rich/40" />
              <span className="absolute bottom-5 left-5 font-serif text-3xl text-ivory">{collection.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-taupe">Featured</p>
        <h2 className="mt-2 font-serif text-4xl">The atelier edit</h2>
        <div className="mt-10">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="my-16 grid min-h-[28rem] bg-espresso text-ivory md:grid-cols-2">
        <div className="relative min-h-80">
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

      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.22em] text-taupe">Discovery</p>
        <h2 className="mt-2 font-serif text-4xl">Explore by impression</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: "Bright", text: "Citrus peel, linen, and air — openings that feel like daylight.", href: "/collections/fresh-and-citrus" },
            { title: "Bloom", text: "Petal, stem, and white flowers with a quiet trail.", href: "/collections/floral" },
            { title: "Depth", text: "Wood, amber, oud, and smoke for evening and cloth.", href: "/collections/oud-and-oriental" },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="border border-espresso/10 bg-white p-8 transition-colors hover:border-champagne">
              <h3 className="font-serif text-3xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-taupe">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-taupe">Arrivals</p>
        <h2 className="mt-2 font-serif text-4xl">Newly composed</h2>
        <div className="mt-10">
          <ProductGrid products={arrivals} />
        </div>
      </section>

      <section className="mx-auto my-16 max-w-3xl px-4 py-16 text-center">
        <h2 className="font-serif text-4xl">Notes from the house</h2>
        <p className="mt-4 text-taupe">
          Occasional letters on new compositions and seasonal edits. No invented offers — just the list, when you want it.
        </p>
        <NewsletterForm />
      </section>
    </>
  );
}
