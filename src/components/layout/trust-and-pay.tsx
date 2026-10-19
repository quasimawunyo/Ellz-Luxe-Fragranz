import { AcceptedPayMarks } from "@/components/brand/accepted-pay-marks";

export function TrustAndPay() {
  return (
    <section className="border-t border-espresso/10 bg-white py-3 sm:py-3.5" aria-label="Payment methods">
      <div className="mx-auto max-w-7xl px-4">
        <AcceptedPayMarks />
      </div>
    </section>
  );
}
