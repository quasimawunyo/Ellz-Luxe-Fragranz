import { ClipboardCheck, CreditCard, Headset, Truck } from "lucide-react";
import { formatGhanaPhone } from "@/lib/whatsapp";

export function HomeTrust({ phone }: { phone: string }) {
  const items = [
    { icon: Truck, title: "Delivery", body: "Between 24-72 hours. Quoted from your location." },
    {
      icon: Headset,
      title: "WhatsApp",
      body: phone ? `Message ${formatGhanaPhone(phone)}.` : "Message the annex.",
    },
    { icon: CreditCard, title: "Secure payments", body: "Fast, safe and reliable." },
    { icon: ClipboardCheck, title: "Genuine products", body: "Authentic, original and safe." },
  ];

  return (
    <section className="border-b border-espresso/10 bg-white" aria-label="Why shop here">
      <div className="mx-auto grid max-w-7xl gap-px bg-espresso/10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-4 bg-white px-6 py-7">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ivory text-espresso">
                <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-taupe">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
