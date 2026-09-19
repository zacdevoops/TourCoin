"use client";

import { useActionState } from "react";
import {
  INITIAL_ACTION_STATE,
  type AdminActionState,
} from "@/lib/admin/action-state";
import { SubmitButton } from "./submit-button";

export function MutationForm({
  action,
  children,
  label,
  pendingLabel,
  confirmMessage,
  className = "",
  buttonClassName = "",
}: {
  action: (state: AdminActionState, data: FormData) => Promise<AdminActionState>;
  children: React.ReactNode;
  label: string;
  pendingLabel?: string;
  confirmMessage?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
      <SubmitButton pendingLabel={pendingLabel} className={buttonClassName}>
        {label}
      </SubmitButton>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
