import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="bg-[#0e3b30] px-4 py-8 text-center text-snow md:py-10" aria-label="Email updates">
      <div className="mx-auto max-w-xl">
        <h2 className="font-serif text-3xl text-snow md:text-4xl">Email updates</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#b7e4c7] md:text-base">
          New arrivals, restocks, and shop notes. Unsubscribe anytime.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
