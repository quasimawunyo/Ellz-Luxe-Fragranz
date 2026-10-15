export class InsufficientStockError extends Error {
  constructor(message = "Insufficient stock for the requested quantity.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export function assertPurchasableQuantity(quantity: number, max = 6) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }
  if (quantity > max) {
    throw new Error(`Quantity cannot exceed ${max}.`);
  }
}

export function canFulfill(stock: number, quantity: number) {
  return (
    Number.isInteger(stock) &&
    stock >= 0 &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    stock >= quantity
  );
}

export function decrementStock(stock: number, quantity: number) {
  if (!canFulfill(stock, quantity)) {
    throw new InsufficientStockError();
  }
  return stock - quantity;
}

/**
 * Applies concurrent inventory reservations in memory.
 * Used for unit tests and the demonstration catalog.
 * Production checkout uses a PostgreSQL transaction with row locks.
 */
export function reserveStockMap(
  stockByVariant: Map<string, number>,
  reservations: { variantId: string; quantity: number }[],
) {
  const next = new Map(stockByVariant);
  for (const reservation of reservations) {
    const current = next.get(reservation.variantId);
    if (current === undefined) {
      throw new Error(`Unknown variant ${reservation.variantId}`);
    }
    next.set(
      reservation.variantId,
      decrementStock(current, reservation.quantity),
    );
  }
  return next;
}
