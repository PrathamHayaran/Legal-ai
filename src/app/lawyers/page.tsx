"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { BadgeCheck, Briefcase, Globe2, Search, ShieldCheck, Star, TimerReset } from "lucide-react";
import { getLawyerProfiles, type LawyerProfile } from "@/lib/auth-state";

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);

  useEffect(() => {
    setLawyers(getLawyerProfiles());
  }, []);

  return (
    <SiteShell title="Verified lawyer marketplace" subtitle="Discover licensed legal professionals by practice area, country, rating, language, and fee.">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <Search className="h-4 w-4" /> Search by country, practice area, or fee
          </div>
          <div className="flex flex-wrap gap-2">
            {['Country', 'State', 'Practice area', 'Rating', 'Language', 'Experience', 'Hourly fee'].map((filter) => (
              <button key={filter} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200">{filter}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {lawyers.map((lawyer) => {
            const isApproved = lawyer.status === "approved";
            return (
              <div key={lawyer.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-semibold text-white">{lawyer.name.split(' ').map((name) => name[0]).join('')}</div>
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isApproved ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : lawyer.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                    {isApproved ? <BadgeCheck className="h-4 w-4" /> : <TimerReset className="h-4 w-4" />} {isApproved ? "Verified" : lawyer.status === "pending" ? "Pending" : "Rejected"}
                  </div>
                </div>
                <div className="mt-5">
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{lawyer.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{lawyer.practiceArea}</p>
                </div>
                <div className="mt-5 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400" /> {lawyer.rating}</div>
                  <div className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-blue-500" /> {lawyer.experience}</div>
                  <div className="flex items-center gap-1"><Globe2 className="h-4 w-4 text-indigo-500" /> {lawyer.location}</div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {isApproved && <span className="rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950/40">Identity Verified</span>}
                  {isApproved && <span className="rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950/40">Face Verified</span>}
                  {isApproved && <span className="rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950/40">Bar Verified</span>}
                  {!isApproved && <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Awaiting review</span>}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <span className="font-semibold text-slate-900 dark:text-white">{lawyer.fee}</span>
                  <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Book consultation <ShieldCheck className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
