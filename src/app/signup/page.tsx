import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-[1.75rem] border border-espresso/10 bg-white p-6 sm:p-8">
        <h1 className="font-serif text-4xl">Create an account</h1>
        <p className="mt-2 text-sm text-taupe">Track orders and save bottles.</p>
        <ActionForm action={signUpAction} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required autoComplete="name" className="rounded-xl px-4" />
          </div>
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
              autoComplete="new-password"
              className="rounded-xl px-4"
            />
          </div>
          <Button type="submit" variant="shop" className="w-full">
            Create account
          </Button>
        </ActionForm>
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-taupe hover:text-espresso">
            Already have an account? Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
