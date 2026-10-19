import Link from "next/link";
import { recoverPasswordAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Password recovery" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-[1.75rem] border border-espresso/10 bg-white p-6 sm:p-8">
        <h1 className="font-serif text-4xl">Reset password</h1>
        <p className="mt-2 text-sm text-taupe">We will email you a link to choose a new password.</p>
        <ActionForm action={recoverPasswordAction} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="rounded-xl px-4" />
          </div>
          <Button type="submit" variant="shop" className="w-full">
            Send reset link
          </Button>
        </ActionForm>
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-taupe hover:text-espresso">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
