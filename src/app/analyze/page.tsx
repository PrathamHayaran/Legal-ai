"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, FileText, MessageSquare, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { analyzeContractFile, chatContractDocument } from "@/lib/contract-api";

export default function AnalyzePage() {
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [question, setQuestion] = useState("What is the termination notice period?");
  const [chatAnswer, setChatAnswer] = useState<string>("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const topRisk = useMemo(() => {
    return analysis?.riskAnalysis?.categories?.[0] ?? null;
  }, [analysis]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setAnalysis(null);
    setSelectedClause(null);
    setDocumentText("");
    setChatAnswer("");
    setLoading(true);
    try {
      const result = await analyzeContractFile(file);
      if (!result.ok) {
        setUploadError(result.error || "Analysis failed.");
      } else {
        setAnalysis(result);
        setDocumentText(result.text || "");
        if (result.clauses?.length) {
          setSelectedClause(result.clauses[0].id);
        }
      }
    } catch (err) {
      setUploadError("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!question.trim() || !documentText) return;
    setChatError(null);
    setChatLoading(true);
    setChatAnswer("");
    try {
      const result = await chatContractDocument(documentText, question);
      if (!result.ok) {
        setChatError(result.error || "Chat failed.");
      } else {
        setChatAnswer(result.answer ?? "No answer returned.");
      }
    } catch (err) {
      setChatError("Chat failed.");
    } finally {
      setChatLoading(false);
    }
  };

  const clauseList = analysis?.clauses ?? [];
  const summary = analysis?.riskAnalysis?.summary;
  const score = analysis?.riskAnalysis?.overallRiskScore;
  const confidence = analysis?.riskAnalysis?.confidence;
  const selectedClauseData = clauseList.find((clause: any) => clause.id === selectedClause) ?? clauseList[0];

  return (
    <SiteShell title="Document analyzer" subtitle="Upload contracts, extract clauses, and generate an explainable risk profile with suggested safer wording.">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
              <ScanLine className="h-4 w-4" /> Upload and analyze
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
              <p>Drag and drop a PDF, DOCX, TXT, or scanned contract. OCR and clause extraction run automatically.</p>
              <div className="mt-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Select document
                  <input type="file" accept=".pdf,.docx,.txt,image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{uploadError}</div>
            )}

            {analysis && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Risk score</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{score ?? "—"}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Confidence</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{confidence ?? "—"}%</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Top exposure</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{topRisk?.category ?? "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                <AlertTriangle className="h-4 w-4" /> Clause heatmap
              </div>
              {analysis?.clauses?.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{analysis.clauses.length} clauses</span>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">Analyzing document…</div>
              ) : clauseList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">No clauses extracted yet. Upload a contract to begin analysis.</div>
              ) : (
                clauseList.map((clause: any) => (
                  <button
                    key={clause.id}
                    onClick={() => setSelectedClause(clause.id)}
                    className={`rounded-3xl border px-4 py-4 text-left text-sm transition ${selectedClause === clause.id ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Clause {clause.number}</span>
                      <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${clause.severity === "High" ? "bg-rose-100 text-rose-600" : clause.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {clause.severity}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-slate-600 dark:text-slate-300">{clause.text}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
              <ShieldCheck className="h-4 w-4" /> Clause explainer
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{selectedClauseData?.text ? `Clause ${selectedClauseData.number}` : "Select a clause"}</h3>
            {selectedClauseData ? (
              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <p className="text-slate-700 dark:text-slate-100"><span className="font-semibold">Clause text:</span> {selectedClauseData.text}</p>
                <p><span className="font-semibold text-slate-950 dark:text-white">Risk signal:</span> {selectedClauseData.severity} severity</p>
                <p><span className="font-semibold text-slate-950 dark:text-white">Suggested improvement:</span> Clarify obligations, narrow liability exposure, and add mutual termination rights.</p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Upload a contract and select a clause to view explainable analysis and suggested improvements.</p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
              <MessageSquare className="h-4 w-4" /> Ask about this contract
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Use natural language questions to get contract-specific answers from the uploaded text.</p>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              className="mt-4 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={handleChatSubmit}
              disabled={chatLoading || !documentText}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {chatLoading ? "Asking…" : "Ask contract question"}
            </button>
            {chatError && <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{chatError}</div>}
            {chatAnswer && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
                <p className="font-semibold text-slate-950 dark:text-white">AI response</p>
                <p className="mt-3 whitespace-pre-wrap">{chatAnswer}</p>
              </div>
            )}
          </div>

          {summary && (
            <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 to-blue-950 p-8 text-white shadow-lg dark:border-slate-800">
              <p className="text-sm uppercase tracking-[0.28em] text-blue-300">Summary</p>
              <p className="mt-4 text-2xl font-semibold">{summary}</p>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <p>• Quickly identify the contract’s most important risks.</p>
                <p>• Use clause-level explanations to support review and negotiation.</p>
                <p>• Keep answers grounded in the uploaded document text.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
