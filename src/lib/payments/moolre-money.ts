export function normalizePayerNetwork(value: string | null | undefined) {
  const raw = value?.trim().toLowerCase() ?? "";
  if (raw === "mtn") return "mtn";
  if (raw === "telecel" || raw === "vodafone") return "telecel";
  if (raw === "at" || raw === "airteltigo" || raw === "airtel tigo" || raw === "tigo") return "at";
  if (raw === "card" || raw === "visa" || raw === "mastercard") return "card";
  return null;
}

export function cedisFromMinor(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

export function minorFromCedis(amount: string | number) {
  const value = typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function moolrePaymentSucceeded(status: { txstatus?: number } | null | undefined) {
  return status?.txstatus === 1;
}

export function moolreAmountMatches(statusAmount: string | number | undefined, expectedMinor: number) {
  const received = statusAmount === undefined ? null : minorFromCedis(statusAmount);
  return received !== null && received === expectedMinor;
}
