import { formatGhanaPhone } from "@/lib/whatsapp";

export function HeroAnnouncement({ location, phone }: { location: string; phone: string }) {
  const place = location.replace(/\s+\.?$/, "").trim();
  const number = phone ? formatGhanaPhone(phone) : "";
  const parts = [place ? `Pickup free at ${place}` : "", "Delivery 24–72 hours", number ? `WhatsApp ${number}` : ""].filter(Boolean);

  return (
    <div className="border-y border-espresso/10 bg-white text-espresso" aria-label="Announcement">
      <p className="mx-auto max-w-6xl px-4 py-3 text-center text-sm">{parts.join(" · ")}</p>
    </div>
  );
}
