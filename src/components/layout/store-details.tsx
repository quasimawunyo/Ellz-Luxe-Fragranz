import type { StoreSettings } from "@/lib/catalog/types";
import { whatsappHref } from "@/lib/whatsapp";

export function StoreContact({
  settings,
  className = "mt-3 space-y-2 text-sm",
}: {
  settings: StoreSettings;
  className?: string;
}) {
  const wa = whatsappHref(settings.contactPhone);
  return (
    <div className={className}>
      {settings.location ? <p>{settings.location}</p> : null}
      {settings.contactPhone ? (
        <p>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
        </p>
      ) : null}
      {wa ? (
        <p>
          <a href={wa} target="_blank" rel="noreferrer">
            WhatsApp {settings.contactPhone}
          </a>
        </p>
      ) : null}
      {settings.contactEmail ? <p>{settings.contactEmail}</p> : null}
    </div>
  );
}

export function StoreSocials({ settings }: { settings: StoreSettings }) {
  const wa = whatsappHref(settings.contactPhone);
  const links = [
    settings.instagramUrl ? { href: settings.instagramUrl, label: "Instagram" } : null,
    settings.tiktokUrl ? { href: settings.tiktokUrl, label: "TikTok" } : null,
    settings.snapchatHandle
      ? { href: `https://www.snapchat.com/add/${settings.snapchatHandle}`, label: "Snapchat" }
      : null,
    wa ? { href: wa, label: "WhatsApp" } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  if (!links.length) return null;

  return (
    <ul className="mt-3 space-y-2 text-sm">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PaymentInstructions({ settings }: { settings: StoreSettings }) {
  return (
    <div className="space-y-2 text-sm">
      {settings.momoNumber ? (
        <p>
          MTN MoMo: <strong>{settings.momoNumber}</strong>
        </p>
      ) : null}
      {settings.momoMerchantId ? (
        <p>
          Merchant ID: <strong>{settings.momoMerchantId}</strong>
        </p>
      ) : null}
      {settings.bankAccount ? (
        <p>
          {settings.bankName || "Bank"}: <strong>{settings.bankAccount}</strong>
        </p>
      ) : null}
      <p className="text-taupe">
        Use your order name as the transfer reference, then send the receipt on WhatsApp.
      </p>
    </div>
  );
}
