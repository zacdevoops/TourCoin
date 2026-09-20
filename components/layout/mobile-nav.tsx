"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const links = [
  ["La flotte", "/cars"],
  ["Notre service", "/#process"],
  ["Contact", "/contact"],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const closeMenu = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, closeMenu]);

  return (
    <div className="relative md:hidden" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex size-11 cursor-pointer items-center justify-center rounded-sm border border-white/20"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open ? (
        <nav
          id={menuId}
          className="absolute right-0 mt-3 grid w-64 rounded-sm border border-white/10 bg-ink p-3 shadow-premium"
          aria-label="Navigation mobile"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            className="mt-2 flex min-h-11 items-center justify-between rounded-sm bg-white px-3 text-sm font-bold text-charcoal"
            onClick={() => setOpen(false)}
          >
            Réserver <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
