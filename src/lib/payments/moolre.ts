import "server-only";

import { env } from "@/lib/env";
import { cedisFromMinor } from "@/lib/payments/moolre-money";
import { verifyMoolreCallbackSecret } from "@/lib/payments/signature";

export { verifyMoolreCallbackSecret };
export {
  cedisFromMinor,
  minorFromCedis,
  moolreAmountMatches,
  moolrePaymentSucceeded,
} from "@/lib/payments/moolre-money";

const MOOLRE_API = "https://api.moolre.com";

export function isMoolreConfigured() {
  return Boolean(env.moolreApiUser && env.moolrePublicKey && env.moolreAccountNumber && env.moolreCallbackSecret);
}

function moolreHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-USER": env.moolreApiUser ?? "",
    "X-API-PUBKEY": env.moolrePublicKey ?? "",
  };
}

type MoolreEnvelope<T> = {
  status: number | string;
  code?: string;
  message?: string | string[] | null;
  data?: T;
};

function envelopeOk(json: MoolreEnvelope<unknown>) {
  return json.status === 1 || json.status === "1";
}

function envelopeMessage(json: MoolreEnvelope<unknown>) {
  if (Array.isArray(json.message)) return json.message.join(" ");
  return json.message || json.code || "Moolre request failed.";
}

export async function generateMoolrePaymentLink(params: {
  amountMinor: number;
  email: string;
  externalRef: string;
  callbackUrl: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}) {
  if (!isMoolreConfigured()) {
    return { configured: false as const };
  }

  const response = await fetch(`${MOOLRE_API}/embed/link`, {
    method: "POST",
    headers: moolreHeaders(),
    body: JSON.stringify({
      type: 1,
      amount: cedisFromMinor(params.amountMinor),
      email: env.moolreBusinessEmail ?? params.email,
      externalref: params.externalRef,
      callback: params.callbackUrl,
      redirect: params.redirectUrl,
      reusable: "0",
      expiration_time: 60,
      currency: "GHS",
      accountnumber: env.moolreAccountNumber,
      metadata: params.metadata,
    }),
  });

  const json = (await response.json()) as MoolreEnvelope<{
    authorization_url?: string;
    reference?: string;
  }>;

  if (!response.ok || !envelopeOk(json) || !json.data?.authorization_url) {
    throw new Error(envelopeMessage(json));
  }

  return {
    configured: true as const,
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference ?? params.externalRef,
  };
}

export type MoolrePaymentStatus = {
  txstatus: number;
  amount?: string;
  value?: string;
  transactionid?: string | null;
  externalref?: string;
  accountnumber?: string;
};

export async function getMoolrePaymentStatus(externalRef: string) {
  if (!isMoolreConfigured()) return null;

  const response = await fetch(`${MOOLRE_API}/open/transact/status`, {
    method: "POST",
    headers: moolreHeaders(),
    body: JSON.stringify({
      type: 1,
      idtype: 1,
      id: externalRef,
      accountnumber: env.moolreAccountNumber,
    }),
  });

  const json = (await response.json()) as MoolreEnvelope<MoolrePaymentStatus>;
  if (!response.ok || !envelopeOk(json) || !json.data) return null;
  return json.data;
}

