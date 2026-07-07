"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { refreshSession, getSession } from "@/lib/auth-state";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      // Avoid redirect loop for /auth
      if (pathname.startsWith("/auth")) {
        setReady(true);
        return;
      }

      const session = getSession();
      // If session contains an email it's likely authenticated locally
      if (session.email) {
        setReady(true);
        return;
      }

      const refreshed = await refreshSession();
      if (!mounted) return;

      if (!refreshed) {
        router.replace("/auth");
        return;
      }

      setReady(true);
    }

    check();
    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (!ready) return null;
  return <>{children}</>;
}
