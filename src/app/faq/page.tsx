import { getFaqs } from "@/lib/catalog/queries";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl">Questions</h1>
      <p className="mt-4 text-taupe">
        Answers marked for owner review are drafts and should not be treated as policy until approved.
      </p>
      <div className="mt-10 space-y-4">
        {faqs.map((item) => (
          <details key={item.id} className="border border-espresso/10 bg-white p-5">
            <summary className="cursor-pointer font-serif text-2xl">
              {item.question}
              {item.requiresOwnerReview ? (
                <span className="ml-2 text-xs uppercase tracking-widest text-champagne">Needs review</span>
              ) : null}
            </summary>
            <p className="mt-3 leading-7 text-taupe">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
