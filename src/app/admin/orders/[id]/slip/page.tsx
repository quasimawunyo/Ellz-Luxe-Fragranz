import Link from "next/link";
import { notFound } from "next/navigation";
import { PackingSlip } from "@/components/admin/packing-slip";
import { getOrderById } from "@/lib/orders/store";

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link href={`/admin/orders/${order.id}`} className="text-sm text-taupe print:hidden">
        Back to {order.orderNumber}
      </Link>
      <div className="mt-4">
        <PackingSlip order={order} />
      </div>
    </div>
  );
}
