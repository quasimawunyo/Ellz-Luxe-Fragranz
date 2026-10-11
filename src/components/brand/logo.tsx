import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 56,
  priority = false,
  href = "/",
  label = "EllzLuxe Fragranz home",
  onDark = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  href?: string | false;
  label?: string;
  onDark?: boolean;
}) {
  const lockup = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/images/mark.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        unoptimized
        className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
      />
      <span className="flex min-w-0 flex-col justify-center">
        <span
          className={cn(
            "font-serif text-[1.35rem] leading-none font-semibold tracking-tight sm:text-[1.5rem]",
            onDark ? "text-ivory" : "text-espresso",
          )}
        >
          EllzLuxe
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.2em]",
            onDark ? "text-champagne" : "text-espresso/65",
          )}
        >
          Fragranz
        </span>
      </span>
    </span>
  );

  if (!href) {
    return lockup;
  }
  return (
    <Link href={href} aria-label={label} className="shrink-0">
      {lockup}
    </Link>
  );
}
