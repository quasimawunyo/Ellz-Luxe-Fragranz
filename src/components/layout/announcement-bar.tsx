import { formatGhanaPhone } from "@/lib/whatsapp";

export function AnnouncementBar({ location, phone }: { location: string; phone: string }) {
  const place = location.replace(/\s+\.?$/, "").trim();
  const number = phone ? formatGhanaPhone(phone) : "";

  return (
    <div className="border-b border-espresso/10 bg-white text-espresso">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-sm">
        {[place ? `Pickup free at ${place}` : "", "Delivery 24–72 hours", number ? `WhatsApp ${number}` : ""].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}
