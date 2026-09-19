"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/admin/password-reset";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { SubmitButton } from "./submit-button";

export function ResetPasswordForm({ requireCurrentPassword }: { requireCurrentPassword: boolean }) {
  const [state, action] = useActionState(updatePassword, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="mt-8 space-y-5">
      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-danger/50 bg-danger/10 p-3 text-sm">
          {state.message}
        </div>
      )}
      {requireCurrentPassword && (
        <div>
          <label htmlFor="current" className="mb-2 block text-sm font-medium">
            Mot de passe actuel
          </label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className="field"
            aria-describedby={state.fieldErrors?.current ? "current-error" : undefined}
          />
          {state.fieldErrors?.current && (
            <p id="current-error" className="mt-1 text-sm text-danger">
              {state.fieldErrors.current[0]}
            </p>
          )}
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="field"
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="mt-1 text-sm text-danger">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="confirm" className="mb-2 block text-sm font-medium">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="field"
          aria-describedby={state.fieldErrors?.confirm ? "confirm-error" : undefined}
        />
        {state.fieldErrors?.confirm && (
          <p id="confirm-error" className="mt-1 text-sm text-danger">
            {state.fieldErrors.confirm[0]}
          </p>
        )}
      </div>
      <SubmitButton className="w-full" pendingLabel="Enregistrement…">
        Changer le mot de passe
      </SubmitButton>
    </form>
  );
}
