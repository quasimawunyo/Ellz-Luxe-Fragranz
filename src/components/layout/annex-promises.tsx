import { ClipboardCheck, CreditCard, Headset, Truck } from "lucide-react";
import { formatGhanaPhone } from "@/lib/whatsapp";

const PROMISES = [
  {
    icon: Truck,
    title: "Ghana delivery",
    body: "Quoted from your location on WhatsApp. Pickup at Ells Luxe Annex, Pantang is free.",
  },
  {
    icon: Headset,
    title: "WhatsApp the Annex",
    body: (phone: string) =>
      phone
        ? `Message ${formatGhanaPhone(phone)} about a bottle, an order, or a quote.`
        : "Message the Annex about a bottle, an order, or a quote.",
  },
  {
    icon: CreditCard,
    title: "Confirmed payment",
    body: "An order is not paid until a WhatsApp receipt or hosted checkout confirms it.",
  },
  {
    icon: ClipboardCheck,
    title: "Testers marked",
    body: "Tester bottles are labelled Tester. Confirm the bottle before you pay.",
  },
] as const;

export function AnnexPromises({ phone }: { phone: string }) {
  return (
    <section className="bg-rich py-12 text-ivory" aria-label="Shopping with Ells Luxe Annex">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map((item) => {
          const Icon = item.icon;
          const body = typeof item.body === "function" ? item.body(phone) : item.body;
          return (
            <div key={item.title} className="text-center">
              <Icon className="mx-auto size-9 stroke-[1.4] text-champagne" aria-hidden />
              <p className="mt-4 text-sm font-medium">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-ivory/70">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
