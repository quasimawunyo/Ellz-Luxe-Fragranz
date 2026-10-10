import { whatsappHref } from "@/lib/whatsapp";

export function WhatsAppButton({ phone }: { phone: string }) {
  const href = whatsappHref(phone, "Hello, I have a question about EllzLuxe Fragranz.");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-7 fill-current">
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.39-1.4a10.1 10.1 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm5.72 13.99c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.83-.12-.42-.13-.97-.32-1.67-.62-2.94-1.27-4.86-4.2-5.01-4.4-.15-.2-1.22-1.62-1.22-3.1 0-1.47.77-2.2 1.04-2.5.27-.3.6-.37.8-.37h.58c.18 0 .43-.07.67.51.24.6.82 2.06.9 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.13.64-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}
