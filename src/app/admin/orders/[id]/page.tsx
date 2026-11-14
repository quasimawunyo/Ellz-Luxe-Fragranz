import Link from "next/link";
import { notFound } from "next/navigation";
import {
  advanceOrderAction,
  cancelOrderAction,
  dismissReviewAction,
  recordManualPaymentAction,
  recordRefundAction,
  requestDeliveryFeeLinkAction,
  setDeliveryFeeAction,
  setOrderTestAction,
} from "@/app/actions/order-desk";
import { CopyText } from "@/components/admin/copy-text";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";
import { StatusPill } from "@/components/admin/status-pill";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { cedisInputFromMinor, formatMoney } from "@/lib/money";
import { amountPaidMinor, balanceDueMinor } from "@/lib/orders/desk";
import { getOrderById } from "@/lib/orders/store";
import {
  canCancelFulfillment,
  customerEmailForFulfilment,
  fulfilmentLabel,
  isPickupOrder,
  nextFulfillmentStatus,
} from "@/lib/orders/transitions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const pickup = isPickupOrder(order.deliveryMethod);
  const next = nextFulfillmentStatus(order.fulfillmentStatus, order.deliveryMethod);
  const paid = amountPaidMinor(order.payments);
  const balance = balanceDueMinor(order.totalMinor, order.payments);
  const feeLink = [...order.payments].reverse().find((payment) => payment.status === "pending" && payment.linkUrl);

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <Link href={`/admin/orders/${order.id}/slip`} className="text-sm underline underline-offset-4">
          Print packing slip
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill value={order.paymentStatus} />
        <StatusPill value={order.fulfillmentStatus} />
        {order.isTest ? <StatusPill value="test" /> : null}
      </div>
      {order.awaitingReview ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p>This paid order was already on the shop. It is still a real sale. Mark it as a test only if it should be left out of revenue and stock.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <ActionForm action={dismissReviewAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit" variant="outline">Keep as a real sale</Button>
            </ActionForm>
            <ActionForm action={setOrderTestAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="isTest" value="on" />
              <Button type="submit" variant="outline">Mark as test</Button>
            </ActionForm>
          </div>
        </section>
      ) : null}
      {order.needsAttention ? (
        <p role="status" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Needs attention. {order.attentionNote}
        </p>
      ) : null}

      <section className="luxe-panel mt-8 p-6">
        <p className="text-sm text-taupe">Customer</p>
        <h2 className="mt-1 text-xl font-semibold">{order.fullName}</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-sm text-taupe">WhatsApp</dt>
            <dd className="mt-1">
              <CustomerWhatsApp phone={order.phone} name={order.fullName} orderNumber={order.orderNumber} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-taupe">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${order.email}`}>{order.email}</a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-taupe">Address</dt>
            <dd className="mt-1">
              {order.addressLine}
              <br />
              {order.locality}, {order.region}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-taupe">Delivery method</dt>
            <dd className="mt-1">{order.deliveryMethod}</dd>
          </div>
          {order.notes ? (
            <div>
              <dt className="text-sm text-taupe">Notes</dt>
              <dd className="mt-1">{order.notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={`${item.sku}-${item.variantLabel}`}>
              {item.productName} · {item.variantLabel} × {item.quantity} ·{" "}
              <Price amountMinor={item.unitPriceMinor * item.quantity} currencyCode={order.currencyCode} />
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Goods</dt>
            <dd>{formatMoney(order.subtotalMinor, order.currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Delivery fee</dt>
            <dd>{pickup ? "GH₵0.00" : formatMoney(order.shippingMinor, order.currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-4 font-medium">
            <dt>Order total</dt>
            <dd>{formatMoney(order.totalMinor, order.currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Amount paid</dt>
            <dd>{formatMoney(paid, order.currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Balance due</dt>
            <dd>{formatMoney(balance, order.currencyCode)}</dd>
          </div>
        </dl>
      </section>

      <ActionForm action={setDeliveryFeeAction} className="mt-8 space-y-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <input type="hidden" name="orderId" value={order.id} />
        <h2 className="font-serif text-2xl">Delivery fee</h2>
        <p className="text-sm text-taupe">
          {pickup ? "Pickup stays at GH₵0.00." : "Enter the fee you quoted on WhatsApp. The order total becomes goods plus this fee."}
        </p>
        <div>
          <Label htmlFor="deliveryFee">Fee (GH₵)</Label>
          <Input
            id="deliveryFee"
            name="deliveryFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={cedisInputFromMinor(order.shippingMinor)}
            readOnly={pickup}
          />
        </div>
        {pickup ? null : <Button type="submit">Save delivery fee</Button>}
      </ActionForm>

      {balance > 0 && !pickup && order.shippingMinor > 0 && !order.isTest ? (
        <ActionForm action={requestDeliveryFeeLinkAction} className="mt-4 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-serif text-2xl">Collect the balance</h2>
          <p className="mt-2 text-sm text-taupe">
            This creates a Moolre payment for {formatMoney(balance, order.currencyCode)}. Copy the link into WhatsApp.
          </p>
          <Button type="submit" className="mt-4">Request delivery fee payment</Button>
          {feeLink?.linkUrl ? <CopyText value={feeLink.linkUrl} /> : null}
        </ActionForm>
      ) : null}

      <ActionForm action={recordManualPaymentAction} className="mt-4 space-y-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
        <input type="hidden" name="orderId" value={order.id} />
        <h2 className="font-serif text-2xl">Record manual payment</h2>
        <p className="text-sm text-taupe">Use this when the customer paid you by mobile money, cash, or card outside a payment link.</p>
        <div>
          <Label htmlFor="method">Method</Label>
          <select id="method" name="method" className="h-11 w-full border border-espresso/15 px-3 text-sm" defaultValue="mobile_money">
            <option value="mobile_money">Mobile money</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>
        <div>
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" name="reference" required />
        </div>
        <div>
          <Label htmlFor="amount">Amount (GH₵)</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
        </div>
        <div>
          <Label htmlFor="paymentNote">Note</Label>
          <Input id="paymentNote" name="note" required />
        </div>
        <Button type="submit">Record payment</Button>
      </ActionForm>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Payment history</h2>
        {order.payments.length ? (
          <ul className="mt-3 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white">
            {order.payments.map((payment) => (
              <li key={payment.id} className="px-4 py-3 text-sm">
                <p>
                  {formatMoney(payment.amountMinor, order.currencyCode)} · {payment.status} · {payment.method?.replaceAll("_", " ") || payment.provider}
                </p>
                <p className="text-taupe">{payment.reference}</p>
                {payment.note ? <p>{payment.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-taupe">No payments yet.</p>
        )}
      </section>

      {next ? (
        <ActionForm action={advanceOrderAction} className="mt-8 space-y-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-serif text-2xl">Next step</h2>
          <p className="text-sm text-taupe">Move this order to {fulfilmentLabel(next)}.</p>
          <div>
            <Label htmlFor="stepNote">Note</Label>
            <Input id="stepNote" name="note" />
          </div>
          {customerEmailForFulfilment(next) ? (
            <label className="flex items-start gap-3 text-sm">
              <input name="emailCustomer" type="checkbox" defaultChecked className="mt-1 size-4" />
              <span>Email the customer.</span>
            </label>
          ) : null}
          <Button type="submit">Mark {fulfilmentLabel(next).toLowerCase()}</Button>
        </ActionForm>
      ) : null}

      {canCancelFulfillment(order.fulfillmentStatus) ? (
        <ActionForm action={cancelOrderAction} className="mt-4 space-y-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-serif text-2xl">Cancel order</h2>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" required />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input name="returnToStock" type="checkbox" className="mt-1 size-4" />
            <span>Return to stock</span>
          </label>
          <Button type="submit" variant="danger">Cancel order</Button>
        </ActionForm>
      ) : null}

      {order.paymentStatus === "paid" ? (
        <ActionForm action={recordRefundAction} className="mt-4 space-y-3 rounded-[1.25rem] border border-espresso/10 bg-white p-5">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-serif text-2xl">Record refund</h2>
          <div>
            <Label htmlFor="refundNote">Note</Label>
            <Input id="refundNote" name="note" required />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input name="returnToStock" type="checkbox" className="mt-1 size-4" />
            <span>Return to stock</span>
          </label>
          <Button type="submit" variant="danger">Record refund</Button>
        </ActionForm>
      ) : null}

      {!order.awaitingReview ? (
        <ActionForm action={setOrderTestAction} className="mt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="isTest" value={order.isTest ? "" : "on"} />
          <Button type="submit" variant="outline">{order.isTest ? "Mark as a real sale" : "Mark as test"}</Button>
        </ActionForm>
      ) : null}

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Timeline</h2>
        {order.events.length ? (
          <ol className="mt-3 space-y-3">
            {order.events.map((event) => (
              <li key={event.id} className="rounded-2xl border border-espresso/10 bg-white px-4 py-3 text-sm">
                <p>
                  {event.eventType.replaceAll("_", " ")}
                  {event.fromValue || event.toValue ? ` · ${event.fromValue ?? "—"} → ${event.toValue ?? "—"}` : ""}
                </p>
                {event.note ? <p className="mt-1">{event.note}</p> : null}
                <p className="mt-1 text-xs text-taupe">
                  {event.actorEmail ?? "Staff"} ·{" "}
                  {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(event.createdAt))}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-taupe">No changes yet.</p>
        )}
      </section>
    </div>
  );
}
