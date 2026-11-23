import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="border-t border-espresso/10 bg-ivory px-4 py-12 text-espresso" aria-label="Email updates">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-3xl">Email updates</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe">
          New arrivals, restocks, and shop notes. Unsubscribe anytime.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
