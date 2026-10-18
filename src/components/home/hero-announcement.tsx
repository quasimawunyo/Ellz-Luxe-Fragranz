import { formatGhanaPhone } from "@/lib/whatsapp";

export function HeroAnnouncement({ location, phone }: { location: string; phone: string }) {
  const place = location.replace(/\s+\.?$/, "").trim();
  const number = phone ? formatGhanaPhone(phone) : "";
  const items = [place ? `Pickup free at ${place}` : "", "Delivery 24–72 hours", number ? `WhatsApp ${number}` : ""].filter(Boolean);

  return (
    <div className="border-y border-champagne/80 bg-ivory text-espresso" aria-label="Announcement">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-4 text-center text-[11px] uppercase tracking-[0.28em] sm:text-xs">
        {items.map((item, index) => (
          <span key={item} className="inline-flex items-center gap-4">
            {index > 0 ? (
              <span className="text-champagne" aria-hidden>
                ·
              </span>
            ) : null}
            {item}
          </span>
        ))}
      </p>
    </div>
  );
}
