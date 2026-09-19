import { redirect } from "next/navigation";
import { AccessError } from "@/components/admin/access-error";
import { LoginForm } from "@/components/admin/login-form";
import { verifyAdmin } from "@/lib/admin/auth";

type Props = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { reset } = await searchParams;
  const access = await verifyAdmin();
  if (access.status === "authorized") redirect("/admin");
  if (access.status === "forbidden" || access.status === "error") {
    return <AccessError message={access.message} />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-6 shadow-premium sm:p-9">
        <p className="eyebrow">Espace privé</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Administration Tourcoin</h1>
        <p className="mt-3 text-muted">
          Connectez-vous avec le compte administrateur de l’entreprise.
        </p>
        {reset === "success" && (
          <p role="status" className="mt-6 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
            Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
          </p>
        )}
        <LoginForm />
      </section>
    </main>
  );
}
