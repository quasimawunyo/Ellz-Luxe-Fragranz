import { AcceptedPayMarks } from "@/components/brand/accepted-pay-marks";

export function TrustAndPay({ phone }: { phone: string }) {
  return (
    <section className="border-t border-espresso/10 bg-white py-8" aria-label="Payment methods">
      <div className="mx-auto max-w-7xl px-4">
        <AcceptedPayMarks />
        <p className="mt-4 text-center text-sm text-taupe">
          Ghana delivery is quoted from your location. Pickup at Ells Luxe Annex
          {phone ? ` · ${phone}` : ""}. Payment is confirmed after checkout.
        </p>
      </div>
    </section>
  );
}
