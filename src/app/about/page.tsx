import Image from "next/image";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 leading-8">
      <h1 className="font-serif text-4xl md:text-5xl">About</h1>
      <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-espresso/5">
        <Image src="/images/story.jpg" alt="" fill className="object-cover" />
      </div>
      <div className="mt-10">
        <p>{settings.aboutStory}</p>
        <p className="mt-6 text-taupe">
          Ells Luxe Annex · {settings.contactPhone || "WhatsApp"} · {settings.contactEmail}
        </p>
      </div>
    </div>
  );
}
