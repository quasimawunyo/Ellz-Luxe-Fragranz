import type { ComponentType, SVGProps } from "react";
import { InstagramIcon, SnapchatIcon, TikTokIcon, WhatsAppIcon } from "@/components/brand/social-icons";
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
  const links: {
    href: string;
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }[] = [
    settings.instagramUrl
      ? { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon }
      : null,
    settings.tiktokUrl ? { href: settings.tiktokUrl, label: "TikTok", Icon: TikTokIcon } : null,
    settings.snapchatHandle
      ? {
          href: `https://www.snapchat.com/add/${settings.snapchatHandle}`,
          label: "Snapchat",
          Icon: SnapchatIcon,
        }
      : null,
    wa ? { href: wa, label: "WhatsApp", Icon: WhatsAppIcon } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!links.length) return null;

  return (
    <ul className="mt-3 flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            title={link.label}
            className="grid size-10 place-items-center rounded-full border border-current/25 text-current transition-colors hover:border-champagne hover:text-champagne"
          >
            <link.Icon />
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
