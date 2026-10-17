"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction] = useActionState(subscribeNewsletter, null);

  return (
    <form action={formAction} className={compact ? "mt-6" : "mt-8"}>
      <div className={compact ? "space-y-2" : "flex gap-2"}>
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className={compact ? "rounded-full bg-ivory px-5 text-espresso" : "flex-1 rounded-full px-5"}
        />
        <Button type="submit" variant={compact ? "gold" : "primary"} className={compact ? "w-full rounded-full" : "rounded-full px-8 uppercase tracking-[0.18em]"}>
          {compact ? "Subscribe" : "Join the list"}
        </Button>
      </div>
      {state?.error ? (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p role="status" className="mt-3 text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
