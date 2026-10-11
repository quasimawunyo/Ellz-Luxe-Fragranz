import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { AcceptedPayMarks } from "@/components/brand/accepted-pay-marks";

export function TrustAndPay({ phone }: { phone: string }) {
  const support = phone ? `Call or WhatsApp ${phone}.` : "Call or message us.";

  return (
    <div>
      <section className="border-t border-espresso/10 bg-white py-8" aria-label="Payment methods">
        <p className="text-center text-sm font-medium">Payment methods</p>
        <div className="mt-4 px-4">
          <AcceptedPayMarks />
        </div>
      </section>
      <section className="bg-rich py-10 text-ivory" aria-label="Why shop with us">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Delivery",
              text: "Nationwide in Ghana, plus pickup at Ells Luxe Annex.",
            },
            {
              icon: Headphones,
              title: "Support",
              text: support,
            },
            {
              icon: CreditCard,
              title: "Payments",
              text: "Card and mobile money, confirmed after checkout.",
            },
            {
              icon: ShieldCheck,
              title: "Products",
              text: "Bottles as listed. Testers are marked on the product page.",
            },
          ].map((item) => (
            <div key={item.title}>
              <item.icon className="size-5 text-champagne" />
              <h2 className="mt-3 text-sm font-medium">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ivory/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
