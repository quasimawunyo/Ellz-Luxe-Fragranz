import "server-only";

import { env } from "@/lib/env";
export { verifyPaystackSignature } from "@/lib/payments/signature";

export function isPaystackConfigured() {
  return Boolean(env.paystackSecretKey && env.paystackPublicKey);
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountMinor: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}) {
  if (!env.paystackSecretKey) {
    return { configured: false as const };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountMinor,
      currency: "GHS",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = (await response.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };

  if (!response.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack initialization failed.");
  }

  return { configured: true as const, ...json.data };
}

export async function refundPaystackTransaction(params: {
  transactionReference: string;
  amountMinor?: number;
}) {
  if (!env.paystackSecretKey) {
    throw new Error("Paystack is not configured.");
  }

  const response = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction: params.transactionReference,
      amount: params.amountMinor,
      currency: "GHS",
    }),
  });

  const json = (await response.json()) as { status: boolean; message: string };
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Paystack refund failed.");
  }
}
