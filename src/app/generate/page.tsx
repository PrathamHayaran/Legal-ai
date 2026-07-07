"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { generateContractDraft } from "@/lib/contract-api";

const templates = [
  "NDA",
  "Employment Agreement",
  "Freelancer Agreement",
  "Vendor Agreement",
  "Partnership Agreement",
  "Consulting Agreement",
  "Service Agreement",
  "Privacy Policy",
  "Terms of Service",
  "IP Assignment",
  "Licensing Agreement",
];

const defaultFields = [
  { key: "partyA", label: "Party A" },
  { key: "partyB", label: "Party B" },
  { key: "effectiveDate", label: "Effective date" },
  { key: "governingLaw", label: "Governing law" },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("Create a vendor agreement for a SaaS provider with strong confidentiality and payment terms.");
  const [template, setTemplate] = useState("NDA");
  const [draft, setDraft] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({
    partyA: "Acme Corp",
    partyB: "Innovate Solutions LLC",
    effectiveDate: "2026-08-01",
    governingLaw: "Delaware",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<Record<string, { prompt: string; metadata: Record<string, string>; template: string }>>({});
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    const storedVersions = window.localStorage.getItem("legalos-draft-versions");
    const storedTemplates = window.localStorage.getItem("legalos-saved-templates");
    if (storedVersions) setVersionHistory(JSON.parse(storedVersions));
    if (storedTemplates) setSavedTemplates(JSON.parse(storedTemplates));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("legalos-draft-versions", JSON.stringify(versionHistory));
  }, [versionHistory]);

  useEffect(() => {
    window.localStorage.setItem("legalos-saved-templates", JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  const draftLines = useMemo(() => draft.split("\n"), [draft]);
  const canGenerate = prompt.trim().length > 0;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateContractDraft(template, prompt, metadata);
      if (!result.ok) {
        setError(result.error || "Generation failed.");
      } else {
        setDraft(result.draft ?? "");
        if (result.versionId) {
          setVersionHistory((prev) => [result.versionId, ...prev.filter((id) => id !== result.versionId)]);
        }
      }
    } catch (err) {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([draft || ""], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${template.replace(/\s+/g, "_")}_draft.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    setSavedTemplates((prev) => ({
      ...prev,
      [templateName]: { prompt, metadata, template },
    }));
    setTemplateName("");
  };

  const handleLoadTemplate = (name: string) => {
    const saved = savedTemplates[name];
    if (!saved) return;
    setPrompt(saved.prompt);
    setMetadata(saved.metadata);
    setTemplate(saved.template);
  };

  return (
    <SiteShell title="AI contract generator" subtitle="Turn natural language into premium legal drafts with export, templates, and session versioning.">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">AI contract generator</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">Generate agreements with confidence and speed.</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-blue-600" /> {template}
              </div>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_0.95fr]">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Draft prompt</p>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {templates.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTemplate(option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${option === template ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Document details</p>
                <div className="mt-5 space-y-4">
                  {defaultFields.map((field) => (
                    <label key={field.key} className="block text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{field.label}</span>
                      <input
                        value={metadata[field.key] ?? ""}
                        onChange={(event) => setMetadata((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Generating..." : "Generate draft"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!draft}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download className="h-4 w-4" /> Export DOCX
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
              <FileText className="h-4 w-4 text-blue-600" /> Version history
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {versionHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">No saved versions yet. Generate a draft to begin versioning.</div>
              ) : (
                versionHistory.map((version, index) => (
                  <div key={`${version}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950 dark:text-white">Version {index + 1}</p>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{version}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Saved from your latest generation request.</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
              <Sparkles className="h-4 w-4" /> Draft preview
            </div>
            <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
              {draft ? (
                draftLines.map((line, index) => (
                  <p key={index} className={index === 0 ? "font-semibold text-slate-950 dark:text-white" : "mt-3"}>{line}</p>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400">Generate a draft to view the output here. The preview updates instantly after AI generation.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-blue-950 p-8 text-white shadow-lg dark:border-slate-800">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-300">Workflow</p>
            <p className="mt-4 text-2xl font-semibold">Save templates, export drafts, and iterate in one premium interface.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <p>• Save prompt templates for repeatable contract generation.</p>
              <p>• Export drafts with a single click.</p>
              <p>• Track version history and preserve each session.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Save as template</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Capture this prompt and metadata for future reuse.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Template name"
                className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save template
              </button>
            </div>
            {Object.keys(savedTemplates).length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Saved templates</p>
                <div className="grid gap-2">
                  {Object.keys(savedTemplates).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleLoadTemplate(name)}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
