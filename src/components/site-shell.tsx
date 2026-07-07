"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoonStar, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { getSession, logout, refreshSession } from "@/lib/auth-state";
import { useVerificationCenter } from "@/components/verification-context";
import { VerificationCenter } from "@/components/verification-center";

const navItems = [
  { label: "Platform", href: "/dashboard" },
  { label: "Generate", href: "/generate" },
  { label: "Analyze", href: "/analyze" },
  { label: "Lawyers", href: "/lawyers" },
  { label: "Admin", href: "/admin" },
];

export function SiteShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [session, setSessionState] = useState(() => getSession());

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("legalos-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("legalos-theme", theme);
  }, [theme]);

  useEffect(() => {
    refreshSession().then((nextSession) => {
      if (nextSession) {
        setSessionState(nextSession);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    setSessionState({ id: null, role: "User", lawyerVerified: true, verificationStatus: "approved", email: null });
    router.push("/auth");
  };

  const signedIn = session.email !== null;
  const isPendingLawyer = session.role === "Lawyer" && session.verificationStatus !== "approved";
  const { open, openVerificationCenter, closeVerificationCenter } = useVerificationCenter();
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.debug("Verification debug", {
      role: session.role,
      verificationStatus: session.verificationStatus,
      isVerificationOpen: open,
      isPendingLawyer,
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">LegalOS</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Legal Copilot</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition ${active ? "text-blue-600 dark:text-blue-400" : "hover:text-slate-900 dark:hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:scale-105 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            </button>
            {signedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-900"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {isPendingLawyer && (
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 px-6 py-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">Pending verification</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Complete your verification without leaving the dashboard</h2>
                <p className="mt-2 text-sm text-slate-700 dark:text-amber-200">Open the Verification Center and finish the application flow with secure document uploads, face verification, and AI review.</p>
              </div>
              <button
                type="button"
                onClick={openVerificationCenter}
                className="inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                Open Verification Center
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8 lg:px-8 lg:py-10">
        {isDev && (
          <div className="mb-6 rounded-3xl border border-slate-300 bg-slate-100 p-4 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <button
              type="button"
              onClick={openVerificationCenter}
              className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Open Verification Center (Dev)
            </button>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Dev session: role={session.role}, verificationStatus={session.verificationStatus}, isVerificationOpen={open ? "true" : "false"}
            </div>
          </div>
        )}
        {(title || subtitle) && (
          <div className="mb-8 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              Premium workspace
            </div>
            {title && <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>}
            {subtitle && <p className="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <VerificationCenter open={open} onClose={closeVerificationCenter} />
    </div>
  );
}
