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

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-4xl">Account</h1>
      <p className="mt-3 text-taupe">{auth.email}</p>
      <ActionForm action={updateProfileAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={auth.profile?.full_name ?? ""} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={auth.profile?.phone ?? ""} />
        </div>
        <Button type="submit">Save</Button>
      </ActionForm>
      <p className="mt-8">
        <Link href="/account/orders">Order history</Link>
      </p>
      {auth.role === "admin" ? (
        <p className="mt-2">
          <Link href="/admin">Admin dashboard</Link>
        </p>
      ) : null}
      <form action={signOutAction} className="mt-8">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
