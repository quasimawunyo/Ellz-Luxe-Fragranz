import Image from "next/image";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata = { title: "Our story" };

const VALUES = [
  { title: "Presence", text: "Scent as a way of arriving — composed, not loud." },
  { title: "Craft", text: "Careful product presentation and honest catalog language." },
  { title: "Access", text: "Luxury that can live in Ghana first, then travel." },
];

export default async function AboutPage() {
  const settings = await getStoreSettings();
  return (
    <div>
      <section className="relative min-h-[50vh] bg-rich">
        <Image src="/images/story.jpg" alt="" fill className="object-cover opacity-60" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-7xl items-end px-4 py-16">
          <h1 className="font-serif text-5xl text-ivory md:text-7xl">Our story</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-16 leading-8">
        <p>{settings.aboutStory}</p>
        <p className="mt-6 text-taupe">
          Values below describe the brand we are building. They are not awards, sourcing claims, or a founder biography.
        </p>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 md:grid-cols-3">
        {VALUES.map((value) => (
          <article key={value.title} className="border border-espresso/10 bg-white p-8">
            <h2 className="font-serif text-3xl">{value.title}</h2>
            <p className="mt-3 text-sm leading-7 text-taupe">{value.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
