import type { ComponentType, ReactNode, SVGProps } from "react";
import { MapPin, Phone } from "lucide-react";
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
          <a href={`tel:${settings.contactPhone}`} className="inline-flex min-h-11 items-center">{settings.contactPhone}</a>
        </ContactRow>
      ) : null}
      {wa ? (
        <ContactRow icon={WhatsAppIcon}>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center">
            {settings.contactPhone}
          </a>
        </ContactRow>
      ) : null}
      {settings.contactEmail ? (
        <p>
          <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-11 items-center">
            {settings.contactEmail}
          </a>
        </p>
      ) : null}
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
            className="grid size-11 place-items-center rounded-full border border-current/25 text-current transition-colors hover:border-champagne hover:text-champagne"
          >
            <link.Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
