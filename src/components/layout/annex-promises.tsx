import { ClipboardCheck, CreditCard, Headset, Truck } from "lucide-react";
import { formatGhanaPhone } from "@/lib/whatsapp";

const PROMISES = [
  {
    icon: Truck,
    title: "Delivery",
    body: "Delivery takes 24–72 hours.",
  },
  {
    icon: Headset,
    title: "WhatsApp",
    body: (phone: string) => (phone ? formatGhanaPhone(phone) : "Message us on WhatsApp."),
  },
  {
    icon: CreditCard,
    title: "Payment",
    body: "Mobile money and card.",
  },
  {
    icon: ClipboardCheck,
    title: "Products",
    body: "Authentic bottles.",
  },
] as const;

export function AnnexPromises({ phone }: { phone: string }) {
  return (
    <section className="bg-rich py-7 text-snow sm:py-8" aria-label="Shopping with EllzLuxe Fragranz">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 lg:grid-cols-4 lg:gap-y-0">
        {PROMISES.map((item) => {
          const Icon = item.icon;
          const body = typeof item.body === "function" ? item.body(phone) : item.body;
          return (
            <div key={item.title} className="px-3 text-center sm:px-5">
              <Icon className="mx-auto size-7 text-champagne sm:size-8" strokeWidth={1.5} aria-hidden />
              <p className="mt-2.5 text-sm">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-snow/80">{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
