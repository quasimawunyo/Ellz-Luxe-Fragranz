"use client";

import { useActionState } from "react";

export type ActionState = { error?: string; ok?: boolean; message?: string; id?: string } | null;

function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
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

export { ActionForm };
export default ActionForm;
