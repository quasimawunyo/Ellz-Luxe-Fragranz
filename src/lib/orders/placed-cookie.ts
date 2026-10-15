import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { readSignedJson, signJson } from "@/lib/cookies/signed-payload";

const PLACED_ORDERS_COOKIE = "elf_placed_orders";
const MAX_REMEMBERED = 40;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  };
}

async function readIds() {
  const secret = env.cookieSigningSecret;
  if (!secret) return [] as string[];
  const store = await cookies();
  const parsed = readSignedJson<unknown>(store.get(PLACED_ORDERS_COOKIE)?.value, secret);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export async function rememberPlacedOrderId(orderId: string) {
  const secret = env.cookieSigningSecret;
  if (!secret) return;
  const next = [orderId, ...(await readIds()).filter((id) => id !== orderId)].slice(0, MAX_REMEMBERED);
  const store = await cookies();
  try {
    store.set(PLACED_ORDERS_COOKIE, signJson(next, secret), cookieOptions());
  } catch {
    // Render paths cannot mutate cookies.
  }
}

export async function browserPlacedThisOrder(orderId: string) {
  if (!env.cookieSigningSecret) return false;
  return (await readIds()).includes(orderId);
}
