import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "inverse" | "outline";
};

export function ButtonLink({ className = "", variant = "primary", ...props }: Props) {
  const styles = {
    primary: "bg-charcoal text-white hover:bg-black",
    inverse: "bg-white text-charcoal hover:bg-paper-muted",
    outline: "border border-black/20 text-charcoal hover:border-charcoal",
  };
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-sm px-6 py-3 text-sm font-bold transition-colors ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
