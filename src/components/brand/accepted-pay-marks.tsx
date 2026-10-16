import type { ReactNode } from "react";
import Image from "next/image";

function Mark({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center ${className ?? ""}`}
      title={label}
      role="img"
      aria-label={label}
    >
      {children}
    </span>
  );
}

export function AcceptedPayMarks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
      <Mark label="Visa">
        <svg viewBox="0 0 24 24" className="h-7 w-[4rem]" aria-hidden>
          <path
            fill="#1A1F71"
            d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
          />
        </svg>
      </Mark>
      <Mark label="Mastercard">
        <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden>
          <circle cx="18" cy="16" r="12" fill="#EB001B" />
          <circle cx="30" cy="16" r="12" fill="#F79E1B" />
          <path d="M24 7.2a12 12 0 0 1 0 17.6 12 12 0 0 1 0-17.6Z" fill="#FF5F00" />
        </svg>
      </Mark>
      <Mark label="MTN Mobile Money">
        <svg viewBox="0 0 56 32" className="h-8 w-14" aria-hidden>
          <rect width="56" height="32" rx="6" fill="#FFCB05" />
          <text
            x="28"
            y="21.5"
            textAnchor="middle"
            fill="#202020"
            fontSize="15"
            fontWeight="800"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            letterSpacing="-0.6"
          >
            mtn
          </text>
        </svg>
      </Mark>
      <Mark label="Telecel Cash">
        <svg viewBox="0 0 118 32" className="h-8 w-[7.4rem]" aria-hidden>
          <circle cx="16" cy="16" r="14" fill="#E32526" />
          <text
            x="16"
            y="22"
            textAnchor="middle"
            fill="#fff"
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-rounded, ui-sans-serif, system-ui, sans-serif"
          >
            t
          </text>
          <text
            x="74"
            y="21"
            textAnchor="middle"
            fill="#E32526"
            fontSize="13"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            telecel cash
          </text>
        </svg>
      </Mark>
      <Mark label="AT Money" className="gap-1.5">
        <Image src="/images/pay/at.png" alt="" width={28} height={28} className="h-7 w-auto" />
        <span className="text-[13px] font-semibold tracking-tight text-[#00377B]">Money</span>
      </Mark>
    </div>
  );
}
