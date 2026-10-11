import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Sign in</h1>
      {!isSupabaseConfigured() ? (
        <p className="mt-4 text-sm text-taupe">
          Customer accounts require Supabase Auth. Add the environment variables to enable sign-in.
        </p>
      ) : null}
      <ActionForm action={signInAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next ?? "/account"} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <Button type="submit">Sign in</Button>
      </ActionForm>
      <p className="mt-6 text-sm">
        <Link href="/signup">Create an account</Link>
        {" · "}
        <Link href="/forgot-password">Forgot password</Link>
      </p>
    </div>
  );
}
