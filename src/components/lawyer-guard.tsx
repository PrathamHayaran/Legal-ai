"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth-state";

export function LawyerGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    const shouldBlock = pathname.startsWith("/dashboard") || pathname.startsWith("/generate") || pathname.startsWith("/analyze") || pathname.startsWith("/admin") || pathname.startsWith("/lawyers");

    if (shouldBlock && session.role === "Lawyer" && session.verificationStatus !== "approved") {
      // Allow lawyers to remain on the dashboard and use the verification modal.
      setReady(true);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
