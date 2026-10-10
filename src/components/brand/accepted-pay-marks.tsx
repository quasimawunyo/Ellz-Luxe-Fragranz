import type { ReactNode } from "react";

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
    <span className={`inline-flex h-10 items-center justify-center ${className ?? ""}`} title={label} role="img" aria-label={label}>
      {children}
    </span>
  );
}

export function AcceptedPayMarks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      <Mark label="Visa">
        <svg viewBox="0 0 60 20" className="h-7 w-[4.2rem]" aria-hidden>
          <rect width="60" height="20" rx="3" fill="#1A1F71" />
          <text x="30" y="14.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="1">
            VISA
          </text>
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
        <svg viewBox="0 0 567 284" className="h-8 w-16" aria-hidden>
          <path
            fill="#F8C000"
            fillRule="evenodd"
            d="M283.46,0C126.91,0,0,63.46,0,141.73S126.91,283.46,283.46,283.46,566.93,220,566.93,141.73,440,0,283.46,0Zm0,261.09c-144.19,0-261.08-53.44-261.08-119.36S139.27,22.38,283.46,22.38,544.55,75.81,544.55,141.73,427.66,261.09,283.46,261.09ZM247.72,116.87V94.49h80v22.38h-28.8V189H276.51V116.87Zm176.5-22.38V189H401.84l-40.59-56.25V189H338.88V94.49h22.37l40.59,56.25V94.49ZM142.05,189V94.49h22.38l24.86,38.24,24.86-38.24h22.38V189H214.15V135.53l-17,26.09H181.4l-17-26.09V189Z"
          />
        </svg>
      </Mark>
      <Mark label="Vodafone Cash">
        <svg viewBox="0 0 92 32" className="h-8 w-[5.8rem]" aria-hidden>
          <rect width="92" height="32" rx="4" fill="#E60000" />
          <text x="46" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
            Vodafone
          </text>
          <text x="46" y="24" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="ui-sans-serif, system-ui, sans-serif">
            Cash
          </text>
        </svg>
      </Mark>
      <Mark label="AirtelTigo Money">
        <svg viewBox="0 0 72 32" className="h-8 w-[4.6rem]" aria-hidden>
          <rect width="72" height="32" rx="4" fill="#ED1C24" />
          <text x="36" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
            airtel
          </text>
          <text x="36" y="24" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="ui-sans-serif, system-ui, sans-serif">
            Money
          </text>
        </svg>
      </Mark>
      <Mark label="Tigo Cash">
        <svg viewBox="0 0 72 32" className="h-8 w-[4.6rem]" aria-hidden>
          <rect width="72" height="32" rx="4" fill="#00A650" />
          <text x="36" y="13" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
            tigo
          </text>
          <text x="36" y="24" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="ui-sans-serif, system-ui, sans-serif">
            Cash
          </text>
        </svg>
      </Mark>
    </div>
  );
}
