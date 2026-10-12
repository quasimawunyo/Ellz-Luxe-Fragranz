import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getOrderByPaymentReference, markOrderPaid } from "@/lib/orders/store";
import {
  getMoolrePaymentStatus,
  isMoolreConfigured,
  moolreAmountMatches,
  moolrePaymentSucceeded,
  verifyMoolreCallbackSecret,
} from "@/lib/payments/moolre";

type MoolreCallback = {
  status?: number;
  code?: string;
  data?: {
    txstatus?: number;
    secret?: string;
    externalref?: string;
    transactionid?: string | null;
    amount?: string;
    accountnumber?: string;
  };
};

export async function POST(request: Request) {
  if (!isMoolreConfigured() || !env.moolreCallbackSecret) {
    return NextResponse.json({ error: "Moolre is not configured" }, { status: 503 });
  }

  const payload = (await request.json()) as MoolreCallback;
  const data = payload.data;
  if (!verifyMoolreCallbackSecret(data?.secret, env.moolreCallbackSecret)) {
    return NextResponse.json({ error: "Invalid callback secret" }, { status: 401 });
  }

  if (env.moolreAccountNumber && data?.accountnumber && data.accountnumber !== env.moolreAccountNumber) {
    return NextResponse.json({ error: "Unexpected account" }, { status: 400 });
  }

  const success =
    payload.status === 1 && payload.code === "P01" && data?.txstatus === 1 && Boolean(data.externalref);

  if (success && data?.externalref) {
    const order = await getOrderByPaymentReference(data.externalref);
    if (!order) {
      return NextResponse.json({ received: true, paid: false });
    }
    const live = await getMoolrePaymentStatus(data.externalref);
    if (!live || !moolrePaymentSucceeded(live)) {
      return NextResponse.json({ received: true, paid: false });
    }
    const amountSource = live.amount ?? live.value ?? data.amount;
    if (!moolreAmountMatches(amountSource, order.totalMinor)) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    await markOrderPaid(
      data.externalref,
      String(data.transactionid ?? data.externalref),
      order.totalMinor,
    );
  }

  return NextResponse.json({ received: true });
}
