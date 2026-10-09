export const DEFAULT_CURRENCY = "GHS";
export const MINOR_UNITS = 100;

export function assertMinorAmount(amountMinor: number) {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Amount must be a non-negative integer in minor units.");
  }
}

export function addMinor(...amounts: number[]) {
  return amounts.reduce((sum, amount) => {
    assertMinorAmount(amount);
    return sum + amount;
  }, 0);
}

export function multiplyMinor(unitMinor: number, quantity: number) {
  assertMinorAmount(unitMinor);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer.");
  }
  return unitMinor * quantity;
}

export function lineTotalMinor(unitMinor: number, quantity: number) {
  return multiplyMinor(unitMinor, quantity);
}

export function cartTotals(lines: { unitMinor: number; quantity: number }[]) {
  const subtotalMinor = lines.reduce(
    (sum, line) => addMinor(sum, lineTotalMinor(line.unitMinor, line.quantity)),
    0,
  );
  return { subtotalMinor };
}

export function orderGrandTotal(subtotalMinor: number, shippingMinor: number) {
  return addMinor(subtotalMinor, shippingMinor);
}

export function formatMoney(
  amountMinor: number,
  currencyCode: string = DEFAULT_CURRENCY,
) {
  assertMinorAmount(amountMinor);
  const major = Math.trunc(amountMinor / MINOR_UNITS);
  const cents = amountMinor % MINOR_UNITS;
  const amount = `${major}.${String(cents).padStart(2, "0")}`;
  if (currencyCode === "GHS") return `GH₵${amount}`;
  return `${currencyCode} ${amount}`;
}
