import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="border-t border-espresso/10 bg-ivory px-4 py-24" aria-label="Email updates">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-taupe">Stay in the loop</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Join the list</h2>
        <p className="mt-6 leading-7 text-taupe">
          New arrivals, restocks, sales date/discounts and shop notes. Unsubscribe anytime.
        </p>
        <div className="mt-8">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
