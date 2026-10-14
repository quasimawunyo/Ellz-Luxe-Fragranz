const FACTS = [
  "Delivery is between 24-72 hours",
  "Pickup at Ells Luxe Annex, Pantang",
  "Secure mobile money and card payments",
];

export function FactTicker() {
  const loop = [...FACTS, ...FACTS];
  return (
    <div className="overflow-hidden border-y border-espresso/10 bg-white py-4" aria-label="Store notes">
      <div className="brand-marquee-track flex w-max items-center gap-10 text-[11px] uppercase tracking-[0.28em] text-taupe">
        {loop.map((fact, index) => (
          <span key={`${fact}-${index}`} className="shrink-0">
            {fact}
          </span>
        ))}
      </div>
    </div>
  );
}
