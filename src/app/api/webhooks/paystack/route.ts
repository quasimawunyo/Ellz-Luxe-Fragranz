import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyPaystackSignature } from "@/lib/payments/signature";
import { getOrderByPaymentReference, markOrderPaid } from "@/lib/orders/store";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const secret = env.paystackWebhookSecret ?? env.paystackSecretKey;
  if (!secret || !verifyPaystackSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: { reference?: string; id?: number; amount?: number; currency?: string };
  };

  if (event.event === "charge.success" && event.data?.reference) {
    const order = await getOrderByPaymentReference(event.data.reference);
    if (!order) {
      return NextResponse.json({ received: true, paid: false });
    }
    if (typeof event.data.amount !== "number" || !event.data.currency) {
      return NextResponse.json({ error: "Amount or currency missing" }, { status: 400 });
    }
    if (event.data.currency !== order.currencyCode || event.data.amount !== order.totalMinor) {
      return NextResponse.json({ error: "Amount or currency mismatch" }, { status: 400 });
    }
    await markOrderPaid(
      event.data.reference,
      String(event.data.id ?? event.data.reference),
      order.totalMinor,
    );
  }

  return NextResponse.json({ received: true });
}
