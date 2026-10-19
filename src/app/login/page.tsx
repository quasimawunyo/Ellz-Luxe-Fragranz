import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { isSupabaseConfigured } from "@/lib/env";
import { safeInternalPath } from "@/lib/security/paths";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-[1.75rem] border border-espresso/10 bg-white p-6 sm:p-8">
        <h1 className="font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-taupe">See your orders and saved bottles.</p>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-sm text-taupe">Customer accounts are not open yet.</p>
        ) : null}
        <ActionForm action={signInAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={safeInternalPath(next)} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="rounded-xl px-4" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              autoComplete="current-password"
              className="rounded-xl px-4"
            />
          </div>
          <Button type="submit" variant="shop" className="w-full">
            Sign in
          </Button>
        </ActionForm>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/signup" className="text-espresso underline-offset-4 hover:underline">
            Create an account
          </Link>
          <Link href="/forgot-password" className="text-taupe hover:text-espresso">
            Forgot password
          </Link>
        </div>
      </div>
    </div>
  );
}
