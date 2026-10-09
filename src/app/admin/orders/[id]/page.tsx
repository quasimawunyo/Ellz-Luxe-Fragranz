import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders/store";
import { refundOrderAction, updateFulfillmentAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Price } from "@/components/ui/price";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-taupe">
        Payment {order.paymentStatus} · Fulfillment {order.fulfillmentStatus}
        {order.paystackReference ? ` · ${order.paystackReference}` : ""}
      </p>
      <p className="mt-4 text-sm">
        {order.fullName} · {order.email} · {order.phone}
        <br />
        {order.addressLine}, {order.locality}, {order.region}
      </p>
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
