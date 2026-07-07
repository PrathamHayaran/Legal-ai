"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, FileText, MessageSquareText, Scale, Sparkles, TrendingUp } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetch("/api/overview")
      .then((res) => res.json())
      .then((data) => setOverview(data))
      .catch(() => setOverview(null));
  }, []);

  return (
    <SiteShell title="Workspace overview" subtitle="Your legal operations command center, combining AI drafting, contract intelligence, and lawyer oversight.">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Documents", value: overview?.overview?.documents ?? "128" },
              { label: "Reviews", value: overview?.overview?.reviews ?? "47" },
              { label: "Risk Score", value: overview?.overview?.riskScore ?? "7.4/10" },
              { label: "Pending Lawyer Reviews", value: overview?.overview?.pendingReviews ?? "12" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">AI usage</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Weekly legal automation load</h3>
              </div>
              <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-600">+18.4%</div>
            </div>
            <div className="mt-6 flex h-48 items-end gap-3">
              {overview?.aiUsage?.map((bar: number, index: number) => (
                <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600 to-indigo-500" style={{ height: `${bar}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-blue-600">Quick actions</p>
            <div className="mt-5 space-y-3">
              {[
                { label: "Upload contract", href: "/analyze", icon: FileText },
                { label: "Generate agreement", href: "/generate", icon: Sparkles },
                { label: "Chat with AI", href: "/analyze", icon: MessageSquareText },
                { label: "Hire lawyer", href: "/lawyers", icon: Scale },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                    <span className="flex items-center gap-3"><Icon className="h-4 w-4" /> {action.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-600/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-100"><Activity className="h-4 w-4" /> Recent activity</div>
            <div className="mt-5 space-y-3 text-sm text-blue-50">
              {overview?.recentActivity?.map((item: string) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
