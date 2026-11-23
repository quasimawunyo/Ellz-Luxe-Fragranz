"use client";

import { useActionState, useEffect, useRef, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

export type ActionState = {
  error?: string;
  fields?: Record<string, string>;
  focus?: string;
  ok?: boolean;
  message?: string;
  id?: string;
} | null;

const FormStateContext = createContext<ActionState>(null);

export function FieldError({ name, className }: { name: string; className?: string }) {
  const state = useContext(FormStateContext);
  const message = state?.fields?.[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" tabIndex={-1} className={cn("mt-2 text-sm text-red-800", className)}>
      {message}
    </p>
  );
}

function focusProblem(form: HTMLFormElement | null, state: ActionState, alert: HTMLElement | null) {
  if (!state?.error && !state?.focus) return;
  if (state.focus && form) {
    const field = form.querySelector<HTMLElement>(`[name="${CSS.escape(state.focus)}"]`);
    if (field) {
      field.focus();
      return;
    }
  }
  alert?.focus();
}

function ActionForm({
  action,
  children,
  className,
  encType,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  encType?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const fieldError = Boolean(state?.fields && Object.keys(state.fields).length > 0);

  useEffect(() => {
    focusProblem(formRef.current, state, alertRef.current);
  }, [state]);

  return (
    <FormStateContext.Provider value={state}>
      <form ref={formRef} action={formAction} className={className} encType={encType}>
        {children}
        {state?.error && !fieldError ? (
          <p ref={alertRef} role="alert" tabIndex={-1} className="mt-3 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}
        {state?.ok && state.message ? (
          <p role="status" className="mt-3 text-sm text-espresso">
            {state.message}
          </p>
        ) : null}
      </form>
    </FormStateContext.Provider>
  );
}

export { ActionForm };
export default ActionForm;
