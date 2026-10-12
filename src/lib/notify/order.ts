import "server-only";

import { env } from "@/lib/env";
import { getStoreSettings } from "@/lib/catalog/queries";
import { annexOrderNotice, ghanaWaDigits, type AnnexOrderNotice } from "@/lib/whatsapp";
import type { StoreOrder } from "@/lib/orders/types";

export function orderToAnnexNotice(order: StoreOrder): AnnexOrderNotice {
  return {
    orderNumber: order.orderNumber,
    fullName: order.fullName,
    phone: order.phone,
    email: order.email,
    region: order.region,
    locality: order.locality,
    addressLine: order.addressLine,
    deliveryMethod: order.deliveryMethod,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    currencyCode: order.currencyCode,
    totalMinor: order.totalMinor,
    shippingMinor: order.shippingMinor,
    items: order.items.map((item) => ({
      productName: item.productName,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
    })),
  };
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function emailAnnex(to: string, notice: string, orderNumber: string) {
  if (!env.resendApiKey || !to) return;
  await postJson(
    "https://api.resend.com/emails",
    {
      from: env.orderNotifyFrom,
      to: [to],
      subject: `New EllzLuxe order ${orderNumber}`,
      text: notice,
    },
    { authorization: `Bearer ${env.resendApiKey}` },
  );
}

async function webhookAnnex(notice: AnnexOrderNotice, body: string) {
  if (!env.orderNotifyWebhookUrl) return;
  await postJson(env.orderNotifyWebhookUrl, { text: body, order: notice });
}

async function callMeBot(phone: string, body: string) {
  if (!env.callMeBotApiKey) return;
  const digits = ghanaWaDigits(phone);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(digits)}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(env.callMeBotApiKey)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function notifyAnnexOfOrder(order: StoreOrder) {
  const settings = await getStoreSettings();
  const notice = orderToAnnexNotice(order);
  const body = annexOrderNotice(notice);
  const jobs = [
    emailAnnex(settings.contactEmail, body, order.orderNumber),
    webhookAnnex(notice, body),
    callMeBot(settings.contactPhone, body),
  ];
  await Promise.allSettled(jobs);
}
