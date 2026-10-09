import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
) {
  if (!signatureHeader) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signatureHeader);
  const expected = Buffer.from(digest);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}
