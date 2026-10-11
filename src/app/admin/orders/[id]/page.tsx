import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders/store";
import { refundOrderAction, updateFulfillmentAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { annexOrderNotice, whatsappHref } from "@/lib/whatsapp";
import { StatusPill } from "@/components/admin/status-pill";
import { cn } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const customerWhatsApp = whatsappHref(order.phone, annexOrderNotice(order));

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill value={order.paymentStatus} />
        <StatusPill value={order.fulfillmentStatus} />
      </div>
      {order.paystackReference ? (
        <p className="mt-3 text-sm text-taupe">Reference {order.paystackReference}</p>
      ) : null}
      <p className="mt-4 text-sm">
        {order.fullName} · {order.email} · {order.phone}
        <br />
        {order.addressLine}, {order.locality}, {order.region}
      </p>
      {customerWhatsApp ? (
        <p className="mt-4">
          <a href={customerWhatsApp} className={cn(buttonVariants({ variant: "gold", size: "sm" }), "inline-flex")} target="_blank" rel="noreferrer">
            WhatsApp this customer
          </a>
        </p>
      ) : null}
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.sku}>
            {item.productName} · {item.variantLabel} · {item.sku} × {item.quantity} ·{" "}
            <Price amountMinor={item.unitPriceMinor * item.quantity} currencyCode={order.currencyCode} />
          </li>
        ))}
      </ul>
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
      <ActionForm action={refundOrderAction} className="mt-6">
        <input type="hidden" name="orderId" value={order.id} />
        <Button type="submit" variant="danger">
          Request Paystack refund
        </Button>
      </ActionForm>
      <p className="mt-3 text-xs text-taupe">
        Refunds go through Paystack. This screen cannot mark an order paid.
      </p>
    </div>
  );
}
