import type { ComponentType, ReactNode, SVGProps } from "react";
import { MapPin, Phone } from "lucide-react";
import { FidelityBankLogo, MtnMomoLogo } from "@/components/brand/payment-logos";
import { InstagramIcon, SnapchatIcon, TikTokIcon, WhatsAppIcon } from "@/components/brand/social-icons";
import type { StoreSettings } from "@/lib/catalog/types";
import { whatsappHref } from "@/lib/whatsapp";

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-champagne" aria-hidden />
      {children}
    </p>
  );
}

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
      {settings.location ? (
        <ContactRow icon={MapPin}>
          <span>{settings.location}</span>
        </ContactRow>
      ) : null}
      {settings.contactPhone ? (
        <ContactRow icon={Phone}>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
        </ContactRow>
      ) : null}
      {wa ? (
        <ContactRow icon={WhatsAppIcon}>
          <a href={wa} target="_blank" rel="noreferrer">
            {settings.contactPhone}
          </a>
        </ContactRow>
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
    <div className="space-y-5 text-sm">
      {settings.momoNumber || settings.momoMerchantId ? (
        <div className="space-y-1.5">
          <MtnMomoLogo />
          {settings.momoNumber ? <p className="font-medium">{settings.momoNumber}</p> : null}
          {settings.momoMerchantId ? (
            <p className="text-xs opacity-80">
              <span className="sr-only">Merchant ID </span>
              {settings.momoMerchantId}
            </p>
          ) : null}
        </div>
      ) : null}
      {settings.bankAccount ? (
        <div className="space-y-1.5">
          <FidelityBankLogo />
          <p className="font-medium">{settings.bankAccount}</p>
        </div>
      ) : null}
      <p className="text-taupe">
        Use your order name as the transfer reference, then send the receipt on WhatsApp.
      </p>
    </div>
  );
}
