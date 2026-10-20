import Link from "next/link";
import { trackOrderAction } from "@/app/actions/orders";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Track order" };

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Track order</h1>
      <p className="mt-4 text-sm leading-6 text-taupe">
        Enter the order number from your confirmation or WhatsApp, and the email used at checkout.
      </p>
      <ActionForm action={trackOrderAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input id="orderNumber" name="orderNumber" placeholder="ELF-…" required autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" className="w-full sm:w-auto">Find order</Button>
      </ActionForm>
      <p className="mt-8 text-sm text-taupe">
        Have an account? <Link href="/account/orders">Order history</Link>
      </p>
    </div>
  );
}
