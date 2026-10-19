"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction] = useActionState(subscribeNewsletter, null);

  if (!compact) {
    return (
      <form action={formAction} className="mx-auto mt-5 w-full max-w-md">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <div className="flex items-center rounded-full border border-[#7dcea0]/35 bg-[#0a2e26] p-1 pl-4">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Enter your email address"
            className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-snow outline-none placeholder:text-[#8fb8a4]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#2fce7a] px-5 py-2 text-sm font-semibold text-[#06281c] hover:bg-[#46d98b]"
          >
            Join
          </button>
        </div>
        {state?.error ? (
          <p role="alert" className="mt-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}
        {state?.ok && state.message ? (
          <p role="status" className="mt-3 text-sm text-[#b7e4c7]">
            {state.message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <div className="space-y-2">
        <label className="sr-only" htmlFor="newsletter-email-compact">
          Email address
        </label>
        <Input
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
