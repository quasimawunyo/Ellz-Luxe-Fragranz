import { WhatsAppIcon } from "@/components/brand/social-icons";
import { customerOrderWhatsAppMessage, formatGhanaPhone, whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function CustomerWhatsApp({
  phone,
  name,
  orderNumber,
  className,
}: {
  phone: string;
  name?: string;
  orderNumber?: string;
  className?: string;
}) {
  const message =
    name && orderNumber ? customerOrderWhatsAppMessage({ fullName: name, orderNumber }) : undefined;
  const href = whatsappHref(phone, message);
  const label = formatGhanaPhone(phone);

  if (!href) {
    return <span className={cn("text-sm text-taupe", className)}>{phone || "No WhatsApp number"}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 text-sm text-espresso hover:text-[#075E54]",
        className,
      )}
    >
      <WhatsAppIcon className="size-5 shrink-0 text-[#25D366]" />
      <span>{label}</span>
      <span className="sr-only">Open WhatsApp chat with {name ?? "customer"}</span>
    </a>
  );
}
