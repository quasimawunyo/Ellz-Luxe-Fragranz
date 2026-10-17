import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="bg-[#0e3b30] px-4 py-20 text-center text-snow" aria-label="Email updates">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-serif text-4xl text-snow md:text-5xl">Email updates</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-[#b7e4c7]">
          New arrivals, restocks, and shop notes. Unsubscribe anytime.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
