import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/catalog/queries";
import { pageMetadata } from "@/lib/seo";
import { PAGE_DESCRIPTIONS } from "@/lib/seo-copy";

const PAGES = {
  privacy: { title: "Privacy policy", key: "privacyNote" as const },
  terms: { title: "Terms and conditions", key: "termsNote" as const },
  shipping: { title: "Shipping and delivery", key: "shippingNote" as const },
  returns: { title: "Returns and refunds", key: "returnsNote" as const },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug as keyof typeof PAGES];
  const descriptions = {
    privacy: PAGE_DESCRIPTIONS.privacy,
    terms: PAGE_DESCRIPTIONS.terms,
    shipping: PAGE_DESCRIPTIONS.shipping,
    returns: PAGE_DESCRIPTIONS.returns,
  };
  if (!page) return { title: "Legal" };
  return pageMetadata({
    title: page.title,
    description: descriptions[slug as keyof typeof descriptions],
    path: `/legal/${slug}`,
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug as keyof typeof PAGES];
  if (!page) notFound();
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">{page.title}</h1>
      <p className="mt-8 leading-8">{settings[page.key]}</p>
    </div>
  );
}
