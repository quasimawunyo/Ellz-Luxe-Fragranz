import { deleteCouponAction, pauseCouponAction, saveCouponAction } from "@/app/actions/coupons";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Coupons · Shop desk" };

export default async function CouponsPage() {
  const admin = createServiceClient();
  const result = admin ? await admin.from("coupons").select("*").order("created_at", { ascending: false }) : { data: [], error: null };
  const coupons = result.error ? [] : (result.data ?? []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-4xl">Coupons</h1>
      <p className="mt-3 text-sm text-taupe">One code per order. A code does not apply to a size that already has a compare-at price.</p>
      <ActionForm action={saveCouponAction} className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" required className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="discountType">Type</Label>
          <select id="discountType" name="discountType" className="min-h-11 w-full border border-espresso/15 bg-white px-3 text-sm">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <Label htmlFor="percent">Percent (1 to 90)</Label>
          <Input id="percent" name="percent" inputMode="numeric" className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="cedis">Fixed amount (GH₵)</Label>
          <Input id="cedis" name="cedis" inputMode="decimal" className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="minimum">Minimum order (GH₵)</Label>
          <Input id="minimum" name="minimum" inputMode="decimal" className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="maxUses">Use limit</Label>
          <Input id="maxUses" name="maxUses" inputMode="numeric" className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" className="min-h-11" />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires</Label>
          <Input id="expiresAt" name="expiresAt" type="datetime-local" className="min-h-11" />
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="active" defaultChecked className="size-5" />
          Active
        </label>
        <Button type="submit" variant="shop" className="min-h-11">
          Save coupon
        </Button>
      </ActionForm>
      {result.error ? <p className="mt-6 text-sm text-taupe">Coupons are not ready yet. Apply the sizes and coupons migration first.</p> : null}
      <ul className="mt-10 divide-y divide-espresso/10">
        {coupons.map((coupon) => (
          <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <div>
              <p className="font-medium">{coupon.code}</p>
              <p className="text-taupe">
                {coupon.discount_type === "percent" ? `${coupon.value_minor}%` : formatMoney(coupon.value_minor)} · {coupon.uses_count}
                {coupon.max_uses ? ` / ${coupon.max_uses}` : ""} uses · {coupon.expires_at ? `expires ${coupon.expires_at.slice(0, 10)}` : "no expiry"} ·{" "}
                {coupon.active ? "Active" : "Paused"}
              </p>
            </div>
            <details className="w-full">
              <summary className="min-h-11 cursor-pointer text-sm">Edit</summary>
              <ActionForm action={saveCouponAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={coupon.id} />
                <Input name="code" defaultValue={coupon.code} aria-label="Code" className="min-h-11" />
                <select name="discountType" defaultValue={coupon.discount_type} aria-label="Type" className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed amount</option>
                </select>
                <Input name="percent" defaultValue={coupon.discount_type === "percent" ? String(coupon.value_minor) : ""} aria-label="Percent" className="min-h-11" />
                <Input name="cedis" defaultValue={coupon.discount_type === "fixed" ? (coupon.value_minor / 100).toFixed(2) : ""} aria-label="Fixed amount" className="min-h-11" />
                <Input name="minimum" defaultValue={coupon.minimum_order_minor ? (coupon.minimum_order_minor / 100).toFixed(2) : ""} aria-label="Minimum order" className="min-h-11" />
                <Input name="maxUses" defaultValue={coupon.max_uses ?? ""} aria-label="Use limit" className="min-h-11" />
                <Input name="startsAt" type="datetime-local" defaultValue={coupon.starts_at ? coupon.starts_at.slice(0, 16) : ""} aria-label="Starts" className="min-h-11" />
                <Input name="expiresAt" type="datetime-local" defaultValue={coupon.expires_at ? coupon.expires_at.slice(0, 16) : ""} aria-label="Expires" className="min-h-11" />
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" name="active" defaultChecked={coupon.active} className="size-5" />
                  Active
                </label>
                <Button type="submit" variant="shop" className="min-h-11">
                  Save changes
                </Button>
              </ActionForm>
            </details>
            <div className="flex gap-2">
              <form action={pauseCouponAction}>
                <input type="hidden" name="id" value={coupon.id} />
                <input type="hidden" name="active" value={coupon.active ? "false" : "true"} />
                <Button type="submit" variant="outline" className="min-h-11">
                  {coupon.active ? "Pause" : "Resume"}
                </Button>
              </form>
              <form action={deleteCouponAction}>
                <input type="hidden" name="id" value={coupon.id} />
                <Button type="submit" variant="outline" className="min-h-11">
                  {coupon.uses_count > 0 ? "Pause" : "Delete"}
                </Button>
              </form>
            </div>
          </li>
        ))}
        {!coupons.length ? <li className="py-8 text-sm text-taupe">No coupons yet.</li> : null}
      </ul>
    </div>
  );
}
