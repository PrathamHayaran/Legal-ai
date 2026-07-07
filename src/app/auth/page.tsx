"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { setSession } from "@/lib/auth-state";

export default function AuthPage() {
  const router = useRouter();
  const [role, setRole] = useState<"User" | "Lawyer" | "Admin">("User");
  const [email, setEmail] = useState("demo@legalos.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      const verificationStatus = data.user.verificationStatus ?? (data.user.role === "LAWYER" ? "pending" : "approved");
      const lawyerVerified = data.user.role !== "LAWYER" || verificationStatus === "APPROVED";

      setSession({
        id: data.user.id,
        role: data.user.role === "LAWYER" ? "Lawyer" : data.user.role === "ADMIN" ? "Admin" : "User",
        lawyerVerified,
        verificationStatus: verificationStatus === "APPROVED" ? "approved" : verificationStatus === "REJECTED" ? "rejected" : "pending",
        email: data.user.email,
      });

      if (data.user.role === "LAWYER") {
        router.push("/dashboard");
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell title="Secure sign in" subtitle="Authenticate as a user, lawyer, or admin and enter the operating workspace.">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2.5"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-lg font-semibold">Enterprise-grade access</p>
              <p className="text-sm text-slate-300">Role-based authentication, MFA-ready, and audit trails built in.</p>
            </div>
          </div>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            {[
              "Email, Google, and GitHub login options",
              "Password reset and MFA support",
              "RBAC with lawyer and admin workflows",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-green-400" /> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              {(["User", "Lawyer", "Admin"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setRole(option)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${role === option ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40" : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200"}`}>
                  {option}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4" /> Email address
              </label>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-900" placeholder="you@company.com" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4" /> Password
              </label>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-900" placeholder="••••••••" />
            </div>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Signing in..." : `Continue as ${role}`} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
