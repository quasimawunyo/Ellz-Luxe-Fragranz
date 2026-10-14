import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="bg-white px-4 py-20" aria-label="Email updates">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-ivory lg:grid-cols-2">
        <div className="bg-rich px-8 py-14 text-ivory md:px-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-ivory/60">Stay in the loop</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Join the list</h2>
          <p className="mt-6 max-w-sm leading-7 text-ivory/70">
            New bottles, restocks, and shop notes. No fake discounts. Unsubscribe anytime.
          </p>
        </div>
        <div className="flex flex-col justify-center px-8 py-14 md:px-12">
          <h3 className="font-serif text-3xl">Restocks, delivered first.</h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-taupe">
            Leave your email for new arrivals and restock messages from EllzLuxe Fragranz.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
