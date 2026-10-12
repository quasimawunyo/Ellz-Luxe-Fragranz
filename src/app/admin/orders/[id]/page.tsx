import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders/store";
import { markOrderPaidAction, refundOrderAction, updateFulfillmentAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { orderShippingIsQuoted } from "@/lib/catalog/helpers";
import { Price } from "@/components/ui/price";
import { StatusPill } from "@/components/admin/status-pill";
import { CustomerWhatsApp } from "@/components/admin/customer-whatsapp";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill value={order.paymentStatus} />
        <StatusPill value={order.fulfillmentStatus} />
      </div>
      {order.paystackReference ? (
        <p className="mt-3 text-sm text-taupe">Reference {order.paystackReference}</p>
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
            <dt className="text-sm text-taupe">Deliver to</dt>
            <dd className="mt-1">
              {order.addressLine}
              <br />
              {order.locality}, {order.region}
              <br />
              {order.deliveryMethod}
            </dd>
          </div>
          {order.notes ? (
            <div>
              <dt className="text-sm text-taupe">Notes</dt>
              <dd className="mt-1">{order.notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.sku}>
            {item.productName} · {item.variantLabel} · {item.sku} × {item.quantity} ·{" "}
            <Price amountMinor={item.unitPriceMinor * item.quantity} currencyCode={order.currencyCode} />
          </li>
        ))}
        <li>
          Delivery ·{" "}
          {orderShippingIsQuoted(order)
            ? `Quoted for ${order.locality}, ${order.region}`
            : /pickup/i.test(order.deliveryMethod)
              ? "Free"
              : <Price amountMinor={order.shippingMinor} currencyCode={order.currencyCode} />}
        </li>
        <li>
          {orderShippingIsQuoted(order) ? "Goods total" : "Total"} ·{" "}
          <Price amountMinor={order.totalMinor} currencyCode={order.currencyCode} />
        </li>
      </ul>
      {order.paymentStatus === "pending" ? (
        <ActionForm action={markOrderPaidAction} className="mt-8">
          <input type="hidden" name="orderId" value={order.id} />
          <Button type="submit">Mark paid</Button>
          <p className="mt-2 text-sm text-taupe">
            Use this after you have received MoMo or cash on WhatsApp. Card payments wait for Moolre.
          </p>
        </ActionForm>
      ) : null}
      <ActionForm action={updateFulfillmentAction} className="mt-8 space-y-3">
        <input type="hidden" name="orderId" value={order.id} />
        <div>
          <Label htmlFor="status">Fulfillment</Label>
          <select id="status" name="status" defaultValue={order.fulfillmentStatus} className="min-h-11 w-full border border-espresso/15 px-3 text-sm">
            <option value="unfulfilled">Unfulfilled</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <Label htmlFor="trackingNumber">Tracking</Label>
          <Input id="trackingNumber" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} />
        </div>
        <Button type="submit">Update fulfillment</Button>
      </ActionForm>
      {order.paymentProvider === "paystack" ? (
        <ActionForm action={refundOrderAction} className="mt-6">
          <input type="hidden" name="orderId" value={order.id} />
          <Button type="submit" variant="danger">
            Request Paystack refund
          </Button>
          <p className="mt-3 text-xs text-taupe">Refunds go through Paystack.</p>
        </ActionForm>
      ) : null}
    </div>
  );
}
