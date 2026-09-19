"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-12 rounded-lg bg-gold px-5 py-3 font-semibold text-ink transition hover:bg-gold-strong disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
