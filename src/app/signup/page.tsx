import { signUpAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="luxe-panel px-8 py-12">
      <h1 className="font-serif text-5xl">Create account</h1>
      <p className="mt-3 text-sm text-taupe">
        The first account on this shop becomes the administrator and can open the dashboard at /admin.
      </p>
      <ActionForm action={signUpAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <Button type="submit">Sign up</Button>
      </ActionForm>
      </div>
    </div>
  );
}
