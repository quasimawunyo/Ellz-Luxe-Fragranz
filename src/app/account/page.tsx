import { redirect } from "next/navigation";
import { signOutAction, updateProfileAction } from "@/app/actions/auth";
import { getAuthContext } from "@/lib/auth/session";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import Link from "next/link";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login?next=/account");

  const name = auth.profile?.full_name?.trim();

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:py-16">
      <h1 className="font-serif text-4xl">{name || "Account"}</h1>
      <p className="mt-2 text-sm text-taupe">{auth.email}</p>

      <section className="mt-8 rounded-[1.75rem] border border-espresso/10 bg-white p-6">
        <h2 className="font-serif text-2xl">Profile</h2>
        <ActionForm action={updateProfileAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={name ?? ""} required className="rounded-xl px-4" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={auth.profile?.phone ?? ""} className="rounded-xl px-4" />
          </div>
          <Button type="submit" variant="shop" className="px-8">
            Save
          </Button>
        </ActionForm>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-[1.25rem] border border-espresso/10 bg-white px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-taupe">Orders</p>
          <p className="mt-2 font-serif text-2xl">Order history</p>
        </Link>
        <Link href="/track" className="rounded-[1.25rem] border border-espresso/10 bg-white px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-taupe">Delivery</p>
          <p className="mt-2 font-serif text-2xl">Track an order</p>
        </Link>
      </div>

      {auth.role === "admin" || auth.role === "super_admin" ? (
        <p className="mt-6 text-sm">
          <Link href="/admin" className="text-taupe hover:text-espresso">
            Admin dashboard
          </Link>
        </p>
      ) : null}
      {auth.role === "super_admin" ? (
        <p className="mt-2 text-sm">
          <Link href="/admin/super" className="text-taupe hover:text-espresso">
            Super admin
          </Link>
        </p>
      ) : null}

      <form action={signOutAction} className="mt-8">
        <button type="submit" className="text-sm text-taupe hover:text-espresso">
          Sign out
        </button>
      </form>
    </div>
  );
}
