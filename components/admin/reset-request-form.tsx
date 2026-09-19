"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/admin/password-reset";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { SubmitButton } from "./submit-button";

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordReset, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="mt-8 space-y-5">
      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-danger/50 bg-danger/10 p-3 text-sm">
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div role="status" className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
          {state.message}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-sm text-danger">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>
      <SubmitButton className="w-full" pendingLabel="Envoi…">
        Envoyer le lien
      </SubmitButton>
    </form>
  );
}
