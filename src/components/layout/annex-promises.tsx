import { ClipboardCheck, CreditCard, Headset, Truck } from "lucide-react";
import { formatGhanaPhone } from "@/lib/whatsapp";

const PROMISES = [
  {
    icon: Truck,
    title: "Ghana Delivery.",
    body: "Quoted on WhatsApp. Pickup at Pantang is free.",
  },
  {
    icon: Headset,
    title: "WhatsApp the Annex.",
    body: (phone: string) =>
      phone
        ? `Message ${formatGhanaPhone(phone)}. Help with a bottle or quote.`
        : "Message the Annex. Help with a bottle or quote.",
  },
  {
    icon: CreditCard,
    title: "Confirmed Payment.",
    body: "Unpaid until WhatsApp or checkout confirms it.",
  },
  {
    icon: ClipboardCheck,
    title: "Testers Marked.",
    body: "Labelled on the shop. Confirm the bottle before you pay.",
  },
] as const;

export function AnnexPromises({ phone }: { phone: string }) {
  return (
    <section className="bg-rich text-ivory" aria-label="Shopping with Ells Luxe Annex">
      <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
        {PROMISES.map((item) => {
          const Icon = item.icon;
          const body = typeof item.body === "function" ? item.body(phone) : item.body;
          return (
            <div key={item.title} className="px-4 py-10 text-center sm:px-8 sm:py-16">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-champagne/40 sm:size-[4.25rem]">
                <Icon className="size-7 text-champagne sm:size-8" strokeWidth={1.25} aria-hidden />
              </span>
              <p className="mt-5 font-serif text-lg leading-snug tracking-wide sm:mt-6 sm:text-[1.35rem] sm:leading-none">
                {item.title}
              </p>
              <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-6 text-ivory/65 sm:mt-3">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
