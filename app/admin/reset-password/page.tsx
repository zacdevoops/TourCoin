import Link from "next/link";
import { RecoverySessionBridge } from "@/components/admin/recovery-session-bridge";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { ResetRequestForm } from "@/components/admin/reset-request-form";
import { getPasswordChangeContext } from "@/lib/admin/password-session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminResetPasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;
  let authenticated = false;
  let requireCurrentPassword = false;

  try {
    const context = await getPasswordChangeContext();
    authenticated = context.authenticated;
    requireCurrentPassword = context.requireCurrentPassword;
  } catch {
    authenticated = false;
  }

  const expired = error === "invalid";

  if (authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-6 shadow-premium sm:p-9">
          <p className="eyebrow">Espace privé</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Changer le mot de passe</h1>
          <p className="mt-3 text-muted">
            Choisissez un mot de passe d’au moins 8 caractères. Vous serez déconnecté après la modification.
          </p>
          <ResetPasswordForm requireCurrentPassword={requireCurrentPassword} />
          <p className="mt-6 text-sm">
            <Link href="/admin" className="font-semibold text-gold hover:text-gold-strong">
              Retour à l’administration
            </Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <RecoverySessionBridge />
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-6 shadow-premium sm:p-9">
        <p className="eyebrow">Espace privé</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Mot de passe oublié ?</h1>
        <p className="mt-3 text-muted">
          Indiquez l’e-mail du compte administrateur. Nous vous enverrons un lien de réinitialisation.
        </p>
        {expired && (
          <p role="alert" className="mt-6 rounded-lg border border-danger/50 bg-danger/10 p-3 text-sm">
            Ce lien a expiré ou n’est plus valide. Demandez un nouvel e-mail.
          </p>
        )}
        <ResetRequestForm />
        <p className="mt-6 text-sm">
          <Link href="/admin/login" className="font-semibold text-gold hover:text-gold-strong">
            Retour à la connexion
          </Link>
        </p>
      </section>
    </main>
  );
}
