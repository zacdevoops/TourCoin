"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAdmin } from "@/lib/admin/actions";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginAdmin, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="mt-8 space-y-5">
      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-danger/50 bg-danger/10 p-3 text-sm">
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
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>
      <p className="text-sm">
        <Link href="/admin/reset-password" className="font-semibold text-gold hover:text-gold-strong">
          Mot de passe oublié ?
        </Link>
      </p>
      <SubmitButton className="w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
