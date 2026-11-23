"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ConfirmSubmit({
  idleLabel,
  confirmLabel,
  detail,
  detailFromForm,
  idempotency = false,
  variant = "primary",
  children,
}: {
  idleLabel: string;
  confirmLabel: string;
  detail: string;
  detailFromForm?: (form: HTMLFormElement) => string;
  idempotency?: boolean;
  variant?: "primary" | "outline" | "danger";
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(detail);
  const [key] = useState(() => crypto.randomUUID());

  return (
    <>
      {idempotency ? <input type="hidden" name="idempotencyKey" value={key} /> : null}
      <Button
        type="button"
        variant={variant}
        disabled={pending}
        onClick={(event) => {
          const form = event.currentTarget.form;
          setText(form && detailFromForm ? detailFromForm(form) : detail);
          setOpen(true);
        }}
      >
        {idleLabel}
      </Button>
      {open ? (
        <div role="dialog" aria-modal="true" className="mt-3 space-y-3 rounded-2xl border border-espresso/15 bg-ivory p-4">
          <p className="text-sm">{text}</p>
          {children}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Go back
            </Button>
            <Button type="submit" variant={variant === "outline" ? "primary" : variant} disabled={pending}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
