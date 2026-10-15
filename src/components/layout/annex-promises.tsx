import { formatGhanaPhone } from "@/lib/whatsapp";

export function AnnexPromises({ phone }: { phone: string }) {
  const items = [
    { title: "Delivery", body: "Between 24–72 hours." },
    {
      title: "WhatsApp",
      body: phone ? `Message ${formatGhanaPhone(phone)}.` : "Message us for help.",
    },
    { title: "Payments", body: "Mobile money and card." },
    { title: "Bottles", body: "Authentic stock from the boutique." },
  ];

  return (
    <section className="border-t border-espresso/10 bg-ivory py-10 text-espresso" aria-label="Shopping with EllzLuxe Fragranz">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title}>
            <p className="font-serif text-xl">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-taupe">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
