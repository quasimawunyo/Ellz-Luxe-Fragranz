import type { ComponentType, ReactNode, SVGProps } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, SnapchatIcon, TikTokIcon, WhatsAppIcon } from "@/components/brand/social-icons";
import { buttonVariants } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { ghanaTelHref, whatsappHref } from "@/lib/whatsapp";

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <p className="grid min-h-11 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-2.5">
      <Icon className="size-4 justify-self-center text-champagne" aria-hidden />
      <span className="min-w-0">{children}</span>
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
  const tel = ghanaTelHref(settings.contactPhone);
  return (
    <div className={className}>
      {settings.location ? (
        <ContactRow icon={MapPin}>
          <span>{settings.location}</span>
        </ContactRow>
      ) : null}
      {settings.contactPhone ? (
        <ContactRow icon={Phone}>
          <a href={tel ?? undefined} className="inline-flex items-center">{settings.contactPhone}</a>
        </ContactRow>
      ) : null}
      {wa ? (
        <ContactRow icon={WhatsAppIcon}>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center text-channel">
            {settings.contactPhone}
          </a>
        </ContactRow>
      ) : null}
      {settings.contactEmail ? (
        <ContactRow icon={Mail}>
          <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center break-all">
            {settings.contactEmail}
          </a>
        </ContactRow>
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

  const tone: Record<string, string> = {
    Instagram: "border-[#E4405F]/40 text-[#E4405F] hover:bg-[#E4405F] hover:text-white",
    TikTok: "border-espresso/20 text-espresso hover:bg-espresso hover:text-[#25F4EE]",
    Snapchat: "border-[#FFFC00] bg-[#FFFC00] text-espresso hover:brightness-95",
    WhatsApp: "border-channel bg-channel text-white hover:bg-channel/90",
  };

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
            className={cn(
              "grid size-11 place-items-center rounded-full border transition-colors",
              tone[link.label] ?? "border-espresso/20 text-espresso hover:border-champagne hover:text-champagne",
            )}
          >
            <link.Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function WhatsAppCta({ phone, message }: { phone: string; message?: string }) {
  const href = whatsappHref(phone, message);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "whatsapp" }), "px-8")}>
      WhatsApp
    </a>
  );
}
