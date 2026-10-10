import Image from "next/image";

export function MtnMomoLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <img
      src="/images/pay/mtn-momo.svg"
      alt="MTN MoMo"
      className={className}
    />
  );
}

export function FidelityBankLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/images/pay/fidelity-bank.png"
      alt="Fidelity Bank"
      width={86}
      height={91}
      unoptimized
      className={className}
    />
  );
}
