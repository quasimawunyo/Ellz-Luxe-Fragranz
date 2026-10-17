import { Mail, Star } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="bg-[#0e3b30] px-4 py-20 text-center text-snow" aria-label="Email updates">
      <div className="mx-auto max-w-2xl">
        <div className="relative mx-auto grid size-[4.25rem] place-items-center rounded-[1.15rem] bg-[#164838] text-[#8fd9a8]">
          <Mail className="size-7" strokeWidth={1.75} aria-hidden />
          <Star className="absolute bottom-3.5 right-3.5 size-3 fill-[#8fd9a8]" aria-hidden />
        </div>
        <h2 className="mt-8 font-serif text-4xl text-snow md:text-5xl">Join our community</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-[#b7e4c7]">
          New arrivals, restocks, and shop notes from EllzLuxe Fragranz. Unsubscribe anytime.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
