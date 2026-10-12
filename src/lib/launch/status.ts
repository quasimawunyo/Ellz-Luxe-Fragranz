import "server-only";

import { env, isSupabaseAdminConfigured } from "@/lib/env";
import { isMoolreConfigured } from "@/lib/payments/moolre";
import { isPaystackConfigured } from "@/lib/payments/paystack";

export function getLaunchStatus() {
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  return {
    siteUrl,
    moolreWebhook: `${siteUrl}/api/webhooks/moolre`,
    paystackWebhook: `${siteUrl}/api/webhooks/paystack`,
    canSaveCatalog: isSupabaseAdminConfigured(),
    moolre: isMoolreConfigured(),
    paystack: isPaystackConfigured(),
    checkout: isMoolreConfigured() ? "Moolre" : isPaystackConfigured() ? "Paystack" : "WhatsApp",
    orderEmail: Boolean(env.resendApiKey),
    orderWhatsAppApi: Boolean(env.callMeBotApiKey),
  };
}
