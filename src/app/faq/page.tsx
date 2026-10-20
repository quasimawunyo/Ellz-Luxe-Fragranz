import { getFaqs } from "@/lib/catalog/queries";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">FAQ</h1>
      <p className="mt-4 text-taupe">Payment, delivery, and returns for EllzLuxe Fragranz.</p>
      <div className="mt-10 space-y-4">
        {faqs
          .filter((item) => !item.requiresOwnerReview)
          .map((item) => (
          <details key={item.id} className="border border-espresso/10 bg-white px-5 py-2">
            <summary className="flex min-h-11 cursor-pointer items-center text-base font-medium">{item.question}</summary>
            <p className="mt-3 leading-7 text-taupe">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
