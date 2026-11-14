import Link from "next/link";
import { getStoreSettings } from "@/lib/catalog/queries";
import { loadSalesSummary } from "@/lib/admin/summary";

export const metadata = { title: "Delivery · Shop desk" };

export default async function DeliveryPage() {
  const [settings, summary] = await Promise.all([getStoreSettings(), loadSalesSummary("7d")]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Delivery</h1>
      <p className="mt-2 text-sm text-taupe">Delivery is quoted on WhatsApp after the order. Pickup at Ells Luxe Annex stays free.</p>
      <ul className="mt-6 space-y-3">
        {settings.deliveryMethods.map((method) => (
          <li key={method.id} className="rounded-[1.25rem] border border-espresso/10 bg-white p-4">
            <p className="font-medium">{method.label}</p>
            <p className="mt-1 text-sm text-taupe">{method.description}</p>
          </li>
        ))}
      </ul>
      <Link href="/admin/orders?view=all&fee=missing" className="mt-6 flex min-h-16 items-center justify-between rounded-[1.25rem] border border-espresso/10 bg-white px-4">
        <span className="text-sm">Orders waiting for a delivery fee</span>
        <span className="font-serif text-2xl">{summary.action.needsFee}</span>
      </Link>
      <p className="mt-4 text-sm">
        <Link href="/admin/settings" className="text-leaf underline underline-offset-4">
          Edit the delivery notes
        </Link>
      </p>
    </div>
  );
}
