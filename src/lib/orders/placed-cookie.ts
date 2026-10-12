import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/json-cookie";

const PLACED_ORDERS_COOKIE = "elf_placed_orders";
const MAX_REMEMBERED = 40;

export async function rememberPlacedOrderId(orderId: string) {
  const existing = await readJsonCookie<string[]>(PLACED_ORDERS_COOKIE, []);
  const next = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, MAX_REMEMBERED);
  await writeJsonCookie(PLACED_ORDERS_COOKIE, next);
}

export async function browserPlacedThisOrder(orderId: string) {
  const ids = await readJsonCookie<string[]>(PLACED_ORDERS_COOKIE, []);
  return ids.includes(orderId);
}
