"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribeNewsletter } from "@/app/actions/commerce";
import { FormGuard } from "@/components/forms/form-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction] = useActionState(subscribeNewsletter, null);
  const wideRef = useRef<HTMLInputElement>(null);
  const compactRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.fields?.email && state?.focus !== "email") return;
    (compact ? compactRef : wideRef).current?.focus();
  }, [compact, state]);

  if (!compact) {
    return (
      <form action={formAction} className="relative mx-auto mt-5 w-full max-w-md">
        <FormGuard />
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <div className="flex items-center border border-espresso/15 bg-white p-1 pl-4">
          <input
            ref={wideRef}
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-espresso outline-none placeholder:text-taupe"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#2fce7a] px-5 py-2 text-sm font-semibold text-[#06281c] hover:bg-[#46d98b]"
          >
            Join
          </button>
        </div>
        {state?.error ? (
          <p role="alert" className="mt-3 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}
        {state?.ok && state.message ? (
          <p role="status" className="mt-3 text-sm text-espresso">
            {state.message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form action={formAction} className="relative mt-6">
      <FormGuard />
      <div className="space-y-2">
        <label className="sr-only" htmlFor="newsletter-email-compact">
          Email address
        </label>
        <Input
          ref={compactRef}
          id="newsletter-email-compact"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="rounded-full bg-ivory px-5 text-espresso"
        />
        <Button type="submit" variant="shop" className="w-full rounded-full px-8">
          Subscribe
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
