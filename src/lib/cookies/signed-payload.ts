import { createHmac, timingSafeEqual } from "node:crypto";

export function signPayload(payload: string, secret: string) {
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSignedPayload(raw: string | undefined, secret: string) {
  if (!raw || !secret) return null;
  const split = raw.lastIndexOf(".");
  if (split <= 0) return null;
  const body = raw.slice(0, split);
  const mac = raw.slice(split + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function signJson<T>(value: T, secret: string) {
  return signPayload(JSON.stringify(value), secret);
}

export function readSignedJson<T>(raw: string | undefined, secret: string): T | null {
  const payload = readSignedPayload(raw, secret);
  if (!payload) return null;
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}
