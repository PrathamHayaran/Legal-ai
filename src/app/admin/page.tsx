"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteShell } from "@/components/site-shell";
import { BarChart3, CheckCircle2, Filter, FileText, Globe2, ShieldCheck, Star, TimerReset, Users, XCircle } from "lucide-react";
import { fetchAdminRequests, fetchAdminStats, fetchAdminVerificationDetails, performAdminAction } from "@/lib/verification-api";

const filters = [
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "BAR_VERIFIED" },
  { label: "Approved", value: "FULLY_VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

type VerificationItem = {
  id: string;
  userId: string;
  status: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  user: { name?: string | null; email?: string | null };
  lawyerProfile?: { state?: string | null; barNumber?: string | null };
};

type VerificationDetail = {
  id: string;
  status: string;
  confidence: number;
  extractedData?: {
    agg?: Record<string, any>;
    extractedAll?: Array<{ docId: string; parsed: Record<string, any>; textSnippet: string }>;
  };
  providerResponses?: Record<string, any>;
  documents?: Array<{ id: string; title: string; fileName: string; mimeType: string; createdAt: string }>;
  history?: Array<{ id: string; action: string; details?: string | null; performedByUserId?: string | null; createdAt: string }>;
  user: { name?: string | null; email?: string | null };
  lawyerProfile?: { state?: string | null; barNumber?: string | null };
};

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<VerificationItem[]>([]);
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [details, setDetails] = useState<VerificationDetail | null>(null);
  const [filter, setFilter] = useState("PENDING");
  const [searchState, setSearchState] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      const statsResponse = await fetchAdminStats();
      const requestsResponse = await fetchAdminRequests();
      if (statsResponse.ok) setStats(statsResponse.stats);
      if (requestsResponse.ok) setRequests(requestsResponse.requests || []);
      setLoading(false);
    }
    loadAdminData();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const selectedUserId = selected.userId;

    async function loadDetails() {
      const response = await fetchAdminVerificationDetails(selectedUserId);
      if (response.ok && response.list?.length) {
        setDetails(response.list[0]);
      }
    }
    loadDetails();
  }, [selected]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const statusMatch = filter ? request.status === filter : true;
      const stateMatch = searchState ? request.lawyerProfile?.state?.toLowerCase().includes(searchState.toLowerCase()) : true;
      return statusMatch && stateMatch;
    });
  }, [requests, filter, searchState]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "FULLY_VERIFIED":
        return "bg-emerald-50 text-emerald-700";
      case "REJECTED":
        return "bg-rose-50 text-rose-700";
      case "BAR_VERIFIED":
      case "IDENTITY_VERIFIED":
        return "bg-blue-50 text-blue-700";
      case "PENDING":
      case "PARTIALLY_VERIFIED":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const handleAction = async (action: "approve" | "reject" | "request_more") => {
    if (!selected) return;
    const response = await performAdminAction({ verificationId: selected.id, action, reason: note });
    if (response.ok) {
      setActionFeedback(action === "approve" ? "Verification approved." : action === "reject" ? "Verification rejected." : "More information requested.");
      setRequests((prev) => prev.map((item) => (item.id === selected.id ? { ...item, status: action === "approve" ? "FULLY_VERIFIED" : action === "reject" ? "REJECTED" : item.status } : item)));
      setSelected((prev) => prev ? { ...prev, status: action === "approve" ? "FULLY_VERIFIED" : action === "reject" ? "REJECTED" : prev.status } : prev);
    } else {
      setActionFeedback(response.error || "Action failed.");
    }
  };

  return (
    <SiteShell title="Admin dashboard" subtitle="Review lawyer verifications, manage trust, and keep the marketplace safe with fast admin controls.">
      <div className="space-y-8">
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Pending verifications", value: stats?.pendingVerifications ?? "—", icon: ShieldCheck },
                { label: "Approved today", value: stats?.approvedToday ?? "—", icon: CheckCircle2 },
                { label: "Rejected", value: stats?.rejected ?? "—", icon: XCircle },
                { label: "Avg confidence", value: `${stats?.averageConfidence ?? "—"}%`, icon: BarChart3 },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{card.value}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-900/40">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Verification queue</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Review requests</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item.value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                  {filteredRequests.length} requests found
                </div>
                <div className="relative max-w-md">
                  <input
                    value={searchState}
                    onChange={(event) => setSearchState(event.target.value)}
                    placeholder="Filter by state or council"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <Filter className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="grid gap-3 p-4 sm:grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr] text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  <span>Lawyer</span>
                  <span>Status</span>
                  <span>State</span>
                  <span>Confidence</span>
                  <span>Submitted</span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse border-t border-slate-200 bg-slate-100 px-4 py-5 dark:border-slate-800 dark:bg-slate-900/80" />
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No verifications match these filters.</div>
                  ) : (
                    filteredRequests.map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => setSelected(request)}
                        className={`w-full px-4 py-5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-950/80 ${selected?.id === request.id ? "bg-blue-50 dark:bg-blue-950/40" : "bg-transparent"}`}
                      >
                        <div className="grid gap-3 sm:grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr] items-center text-sm text-slate-700 dark:text-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/50">{request.user.name?.split(" ").map((part) => part.charAt(0)).join("")}</div>
                            <div>
                              <p className="font-semibold">{request.user.name || request.user.email}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{request.user.email}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(request.status)}`}>{request.status.replace(/_/g, " ")}</span>
                          <span>{request.lawyerProfile?.state ?? "—"}</span>
                          <span>{request.confidence}%</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                <Star className="h-4 w-4 text-blue-600" /> Verification snapshot
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  ["Average review time", `${stats?.averageReviewTimeHours ?? "—"} hrs`],
                  ["Requests pending", stats?.pendingVerifications ?? "—"],
                  ["Approved today", stats?.approvedToday ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                <Globe2 className="h-4 w-4 text-slate-500" /> Live activity
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>New verification requests are reviewed in order by priority and confidence score.</p>
                <p>Use the controls to approve, reject, or request more information directly from the lawyer.</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div key="details" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Selected request</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{selected.user.name || selected.user.email}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selected.lawyerProfile?.state ?? "Unknown jurisdiction"} · {selected.lawyerProfile?.barNumber ?? "No bar number"}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusBadge(selected.status)}`}>{selected.status.replace(/_/g, " ")}</span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900/70 dark:text-slate-200">{selected.confidence}% confidence</span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Uploaded documents</p>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80">
                        <p className="font-semibold text-slate-900 dark:text-white">Government ID</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Uploaded and awaiting OCR review.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80">
                        <p className="font-semibold text-slate-900 dark:text-white">Bar certificate</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Uploaded and queued for validation.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80">
                        <p className="font-semibold text-slate-900 dark:text-white">Face selfie</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Face verification request received.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">AI extraction</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <div className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                        <p className="font-semibold">Full name</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{details?.extractedData?.agg?.fullName ?? "Maya Patel"}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                        <p className="font-semibold">Enrollment</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{details?.extractedData?.agg?.barNumber ?? "LND-887-210"}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                        <p className="font-semibold">State Bar Council</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{details?.extractedData?.agg?.stateBar ?? "England & Wales Bar Council"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">OCR preview</p>
                    <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-600 dark:bg-slate-950/80 dark:text-slate-300">
                      <p>{details?.extractedData?.extractedAll?.[0]?.textSnippet ?? "Text preview will appear here once OCR completes."}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Provider responses</p>
                    <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                        <p className="font-semibold">Face provider</p>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">{details?.providerResponses?.face?.details ?? "Face provider has not yet returned a result."}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                        <p className="font-semibold">Bar provider</p>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">{details?.providerResponses?.bar?.details ?? "Bar provider has not yet returned a result."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Verification history</p>
                    <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      {(details?.history ?? []).length > 0 ? (
                        details?.history?.map((entry) => (
                          <div key={entry.id} className="rounded-3xl bg-white p-4 dark:bg-slate-950/80">
                            <p className="font-semibold text-slate-900 dark:text-white">{entry.action.replace(/_/g, " ")}</p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">{entry.details ?? "No details provided."}</p>
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-3xl bg-white p-4 text-slate-500 dark:bg-slate-950/80 dark:text-slate-400">No history yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin actions</p>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Add internal notes or request details from the lawyer"
                      className="mt-4 min-h-[130px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleAction("approve")}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("reject")}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("request_more")}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-600"
                      >
                        Request more info
                      </button>
                    </div>
                    {actionFeedback && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{actionFeedback}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SiteShell>
  );
}
