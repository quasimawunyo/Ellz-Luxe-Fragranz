export function paystackChargeMatchesOrder(
  data: { amount?: unknown; currency?: unknown } | undefined,
  order: { totalMinor: number; currencyCode: string },
) {
  if (!data) return false;
  if (typeof data.amount !== "number" || !Number.isInteger(data.amount)) return false;
  if (typeof data.currency !== "string" || !data.currency) return false;
  return data.amount === order.totalMinor && data.currency === order.currencyCode;
}
