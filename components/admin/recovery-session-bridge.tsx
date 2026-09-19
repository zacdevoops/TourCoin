"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function RecoverySessionBridge() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token") && !hash.includes("type=recovery")) return;

    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      window.history.replaceState(null, "", window.location.pathname);
      window.location.reload();
    });
  }, []);

  return null;
}
