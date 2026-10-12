import { ClipboardCheck, CreditCard, Headset, Truck } from "lucide-react";
import { formatGhanaPhone } from "@/lib/whatsapp";

const PROMISES = [
  {
    icon: Truck,
    title: "Delivery.",
    body: "Delivery is between 24-72 hours!",
  },
  {
    icon: Headset,
    title: "WhatsApp Support.",
    body: (phone: string) =>
      phone ? `Message ${formatGhanaPhone(phone)}. Get help now!` : "Message the Annex. Get help now!",
  },
  {
    icon: CreditCard,
    title: "Secure Payments.",
    body: "Fast, Safe & reliable!",
  },
  {
    icon: ClipboardCheck,
    title: "Genuine Products.",
    body: "Authentic, Original & Safe!",
  },
] as const;

export function AnnexPromises({ phone }: { phone: string }) {
  return (
    <section className="bg-rich py-12 text-ivory sm:py-14" aria-label="Shopping with Ells Luxe Annex">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 lg:grid-cols-4 lg:gap-y-0">
        {PROMISES.map((item) => {
          const Icon = item.icon;
          const body = typeof item.body === "function" ? item.body(phone) : item.body;
          return (
            <div key={item.title} className="px-3 text-center sm:px-6">
              <Icon className="mx-auto size-10 text-champagne sm:size-11" strokeWidth={1.5} aria-hidden />
              <p className="mt-4 text-sm">{item.title}</p>
              <p className="mt-2 text-sm leading-6">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
