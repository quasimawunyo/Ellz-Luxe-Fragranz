export function normalizeOrderNumber(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function orderEmailMatches(orderEmail: string, givenEmail: string) {
  return orderEmail.trim().toLowerCase() === givenEmail.trim().toLowerCase();
}
