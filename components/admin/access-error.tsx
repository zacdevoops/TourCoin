import { ShieldAlert } from "lucide-react";
import { signOutAdmin } from "@/lib/admin/actions";

export function AccessError({
  title = "Accès administrateur refusé",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <section
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-line bg-surface-raised p-6 text-center shadow-premium sm:p-10"
      >
        <ShieldAlert className="mx-auto mb-5 size-10 text-danger" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-muted">{message}</p>
        <form action={signOutAdmin} className="mt-7">
          <button className="min-h-12 rounded-lg border border-line px-5 py-3 font-semibold hover:border-gold">
            Se déconnecter
          </button>
        </form>
      </section>
    </main>
  );
}
