import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { AcceptedPayMarks } from "@/components/brand/accepted-pay-marks";

export function TrustAndPay({ phone }: { phone: string }) {
  const support = phone ? `Call or WhatsApp ${phone}.` : "Call or message the house.";

  return (
    <div>
      <section className="border-t border-champagne/20 bg-ivory py-10" aria-label="Payment methods">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-espresso">
          Payment methods
        </p>
        <div className="mt-5 px-4">
          <AcceptedPayMarks />
        </div>
      </section>
      <section className="bg-rich py-10 text-ivory" aria-label="Why shop with us">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Nationwide delivery",
              text: "Dispatch across Ghana, plus pickup at Ells Luxe Annex.",
            },
            {
              icon: Headphones,
              title: "Online support",
              text: support,
            },
            {
              icon: CreditCard,
              title: "Secure payments",
              text: "Card and mobile money, confirmed with the house.",
            },
            {
              icon: ShieldCheck,
              title: "Genuine products",
              text: "House bottles as listed, with demonstration pieces marked.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <item.icon className="mx-auto size-8 text-champagne" />
              <h2 className="mt-3 font-serif text-xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ivory/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
