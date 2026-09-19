import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & { variant?: "gold" | "outline" };

export function ButtonLink({ className = "", variant = "gold", ...props }: Props) {
  const style =
    variant === "gold"
      ? "bg-gold text-ink hover:bg-gold-strong"
      : "border border-line bg-ink/20 text-ivory hover:border-gold";
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-sm px-6 py-3 text-sm font-bold transition-colors ${style} ${className}`}
      {...props}
    />
  );
}
