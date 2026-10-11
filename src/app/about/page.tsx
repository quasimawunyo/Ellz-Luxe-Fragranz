import Image from "next/image";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  return (
    <div>
      <section className="relative min-h-[40vh] bg-rich">
        <Image src="/images/story.jpg" alt="" fill className="object-cover opacity-60" />
        <div className="relative mx-auto flex min-h-[40vh] max-w-7xl items-end px-4 py-12">
          <h1 className="font-serif text-4xl text-ivory md:text-5xl">About</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-16 leading-8">
        <p>{settings.aboutStory}</p>
        <p className="mt-6 text-taupe">
          Ells Luxe Annex · {settings.contactPhone || "WhatsApp"} · {settings.contactEmail}
        </p>
      </div>
    </div>
  );
}
