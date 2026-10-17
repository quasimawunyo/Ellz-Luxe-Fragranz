import { formatGhanaPhone } from "@/lib/whatsapp";

export function AnnouncementBar({ location, phone }: { location: string; phone: string }) {
  const place = location.replace(/\s+\.?$/, "").trim();
  const number = phone ? formatGhanaPhone(phone) : "";

  return (
    <div className="bg-leaf text-snow">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] leading-5 sm:text-xs">
        <span>Pickup free at {place}</span>
        <span className="mx-2 text-champagne" aria-hidden>
          ·
        </span>
        <span>Delivery 24–72 hours, quoted on WhatsApp</span>
        {number ? (
          <>
            <span className="mx-2 text-champagne" aria-hidden>
              ·
            </span>
            <span>WhatsApp {number}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
