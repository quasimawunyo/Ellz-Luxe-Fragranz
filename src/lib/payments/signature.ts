import { createHmac, timingSafeEqual } from "node:crypto";

function secretsMatch(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
) {
  if (!signatureHeader) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  return secretsMatch(signatureHeader, digest);
}

export function verifyMoolreCallbackSecret(received: string | undefined, expected: string) {
  if (!received) return false;
  return secretsMatch(received, expected);
}
