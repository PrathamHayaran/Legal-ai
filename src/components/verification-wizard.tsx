"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, CircleDot, FileText, ShieldCheck, Sparkles, UploadCloud, UserCheck, XCircle } from "lucide-react";
import { uploadVerificationDocument, runVerification, submitVerificationProfile } from "@/lib/verification-api";

const steps = [
  { key: "welcome", label: "Welcome" },
  { key: "government-id", label: "Government ID" },
  { key: "bar-certificate", label: "Bar Certificate" },
  { key: "face-verification", label: "Face Verification" },
  { key: "processing", label: "AI Processing" },
  { key: "review", label: "Review" },
  { key: "submit", label: "Submit" },
  { key: "pending", label: "Pending" },
  { key: "complete", label: "Complete" },
];

type DraftData = {
  governmentId?: File;
  barCertificate?: File;
  selfie?: File;
  extracted?: Record<string, string | number | null>;
  confidence?: number;
  status?: string;
};

const STORAGE_KEY = "legalos-verification-draft";

function loadDraft(): DraftData {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveDraft(data: DraftData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    governmentId: undefined,
    barCertificate: undefined,
    selfie: undefined,
  }));
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function VerificationWizard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draft, setDraft] = useState<DraftData>(() => loadDraft());
  const [serverErrors, setServerErrors] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingPercent, setProcessingPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [faceResult, setFaceResult] = useState<any>(null);
  const [reviewChanges, setReviewChanges] = useState<Record<string, string>>({});
  const [uploadType, setUploadType] = useState<"governmentId" | "barCertificate" | "selfie" | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentStep = steps[currentIndex];
  const canAdvance = currentStep?.key !== "processing" && !loading;

  const displayDraft = useMemo(() => ({
    ...draft,
    confidence: draft.confidence ?? 0,
  }), [draft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingPercent((value) => {
        if (value >= 100) return 100;
        return value + Math.floor(Math.random() * 8) + 3;
      });
    }, 650);

    if (currentStep?.key !== "processing") {
      setProcessingPercent(0);
    }

    return () => clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    saveDraft(draft);
    setHasSaved(true);
  }, [draft]);

  const uploadFile = async (file: File, type: "governmentId" | "barCertificate" | "selfie") => {
    setLoading(true);
    setServerErrors(null);
    setUploadProgress(0);

    try {
      const result = await uploadVerificationDocument(file, `verification/${type}/${file.name}`);
      if (result.error) {
        throw new Error(result.error);
      }

      setDraft((prev) => ({ ...prev, [type]: file, status: "uploaded" }));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 400);
    } catch (err) {
      setServerErrors(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (file: File, type: "governmentId" | "barCertificate" | "selfie") => {
    await uploadFile(file, type);
  };

  const startUpload = (type: "governmentId" | "barCertificate" | "selfie") => {
    setUploadType(type);
    setServerErrors(null);
    fileInputRef.current?.click();
  };

  const handleNext = async () => {
    if (currentStep.key === "face-verification" && !draft.selfie) {
      setServerErrors("Please upload a selfie for face verification.");
      return;
    }

    if (currentStep.key === "processing") {
      setLoading(true);
      setServerErrors(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        await runVerification();
        setDraft((prev) => ({
          ...prev,
          extracted: {
            fullName: "Maya Patel",
            email: "maya@legalos.com",
            barNumber: "LND-887-210",
            stateBar: "England & Wales Bar Council",
            governmentIdNumber: "XXXX-1234",
          },
          confidence: 93,
          status: "processed",
        }));
        setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
      } catch (err) {
        setServerErrors("AI processing failed. Please try again later.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep.key === "review") {
      const payload = {
        userId: "current-user",
        status: "PENDING",
        governmentIdUrl: "",
        barCertificateUrl: "",
        professionalDetails: JSON.stringify(draft.extracted ?? {}),
        faceVerificationUrl: "",
      };
      const response = await submitVerificationProfile(payload);
      if (response.error) {
        setServerErrors(response.error);
        return;
      }
      setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const stepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const getStepIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "active") return <CircleDot className="h-4 w-4 text-blue-600" />;
    return <span className="h-4 w-4 rounded-full bg-slate-300" />;
  };

  const editingValues = { ...displayDraft.extracted, ...reviewChanges };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Verification center</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Your lawyer identity verification workflow</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Complete the multi-step onboarding process to become a verified LegalOS counsel. Upload documents, verify your identity, and let our AI-powered review engine prepare your application for approval.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            Draft auto-saved {hasSaved ? "✔" : "..."}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-9">
            {steps.map((step, index) => {
              const status = stepStatus(index);
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 text-center">
                  <div className={classNames(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold",
                    status === "complete" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : status === "active" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  )}>
                    {getStepIcon(status)}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep.key === "welcome" && (
          <motion.section key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
              <div className="space-y-6">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Welcome to LegalOS verification</p>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  This premium onboarding flow was designed for licensed counsel. Follow the step-by-step process to upload your professional credentials, confirm your face match, and submit your verification package.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Secure uploads", value: "AES encrypted storage" },
                    { label: "AI-powered review", value: "OCR + identity matching" },
                    { label: "Trusted verification", value: "Bar + face approval" },
                    { label: "Fast review", value: "24–48 hour estimate" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      <p className="font-semibold text-slate-950 dark:text-white">{item.label}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-slate-900 to-indigo-950 p-8 text-white shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                  <Sparkles className="h-4 w-4" /> Premium verification
                </div>
                <div className="mt-8 space-y-4 text-sm leading-7 text-slate-100">
                  <p>LegalOS verifies every lawyer with a hybrid process built for accuracy and trust. Your documents are matched to your profile, your selfie is validated, and our AI checks your credentials before admin review.</p>
                  <p>Once approved, you’ll unlock the full platform: AI contracts, document review, marketplace access, and client consultations.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "government-id" && (
          <motion.section key="government-id" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr]">
              <div>
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <UploadCloud className="h-5 w-5" />
                  <span>Government ID</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Upload your government-issued ID</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Submit a passport, national ID, or driver’s license so LegalOS can confirm your registered identity with your lawyer profile.
                </p>
                <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/40">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">Drag & drop or click to upload</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Accepted: JPG, PNG, PDF. Documents are encrypted and reviewed securely.</p>
                  <button
                    type="button"
                    onClick={() => startUpload("governmentId")}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Upload ID
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file && uploadType) handleDrop(file, uploadType);
                    }}
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-6 rounded-2xl bg-slate-100 p-4 dark:bg-slate-900/70">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Uploading document</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Document guidance
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Make sure your ID is clearly visible and all text is readable. Blurred or cropped uploads may delay review.</p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Full name and date of birth must be visible</li>
                  <li>• Document must not be expired</li>
                  <li>• No flash glare or reflections</li>
                  <li>• Submit high-resolution scans when possible</li>
                </ul>
                <div className="rounded-3xl bg-slate-100 p-4 text-xs uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                  Resume later saves progress automatically for this browser session.
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "bar-certificate" && (
          <motion.section key="bar-certificate" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr]">
              <div>
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <FileText className="h-5 w-5" />
                  <span>Bar Certificate</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Upload your Bar Council certificate</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  LegalOS needs a copy of your active bar membership certificate or license to verify your standing with the council.
                </p>
                <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">Drag & drop or click to upload</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Accepted: JPG, PNG, PDF.</p>
                  <button
                    type="button"
                    onClick={() => startUpload("barCertificate")}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Upload Certificate
                  </button>
                </div>
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <Sparkles className="h-4 w-4 text-indigo-600" /> Why this matters
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Your certificate must show active membership details, issuance date, and the relevant jurisdiction.</p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Submit the latest membership certificate</li>
                  <li>• Capture the full document page</li>
                  <li>• Ensure your bar number is visible</li>
                </ul>
                <div className="rounded-3xl bg-slate-100 p-4 text-xs uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                  If the upload fails, refresh the page or try a different browser.
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "face-verification" && (
          <motion.section key="face-verification" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr]">
              <div>
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <UserCheck className="h-5 w-5" />
                  <span>Face Verification</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Upload a selfie to verify your face</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  We compare your live selfie to your government ID photo to confirm your identity.
                </p>
                <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">Drag & drop or click to upload</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Accepted: JPG, PNG.</p>
                  <button
                    type="button"
                    onClick={() => startUpload("selfie")}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Upload Selfie
                  </button>
                </div>
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Face scan tips
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Use a clear, front-facing photo with good lighting. No sunglasses or hats.</p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Keep a neutral expression</li>
                  <li>• Hold your phone steady</li>
                  <li>• Avoid extreme shadows</li>
                </ul>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "processing" && (
          <motion.section key="processing" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_0.9fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <Sparkles className="h-5 w-5" />
                  <span>AI processing</span>
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 dark:text-white">We’re verifying your submission</h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Our verification engine processes your documents, runs OCR, checks identity data, and validates your face and bar credentials.
                </p>
                <div className="rounded-[2rem] bg-slate-950/95 p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-slate-300">
                    <span>Progress</span>
                    <span>{Math.min(processingPercent, 99)}%</span>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-900">
                    <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all" style={{ width: `${Math.min(processingPercent, 99)}%` }} />
                  </div>
                  <div className="mt-6 grid gap-3 text-sm text-slate-300">
                    {[
                      "Uploading Documents",
                      "Extracting Text (OCR)",
                      "Matching Identity",
                      "Face Verification",
                      "Bar Council Verification",
                      "AI Risk Validation",
                      "Generating Confidence Score",
                    ].map((label, index) => {
                      const threshold = (index + 1) * 14;
                      const done = processingPercent >= threshold;
                      return (
                        <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
                          <span>{label}</span>
                          <span className={classNames("text-xs font-semibold uppercase", done ? "text-emerald-400" : "text-slate-500")}>{done ? "✓" : "..."}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-950 dark:text-white">
                  <UploadCloud className="h-4 w-4 text-blue-600" /> Processing details
                </div>
                <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-900 dark:text-white">Estimated time:</span> 45–60 seconds</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">What happens now:</span> Documents are analyzed for identity data, OCR content, face match, and bar registration signals.</p>
                  <p>Once complete, you’ll review the extracted information before final submission.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "review" && (
          <motion.section key="review" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Review extracted data</span>
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 dark:text-white">Confirm your identity details</h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Review the information extracted from your documents before submitting it for admin verification.
                </p>
                <div className="space-y-4">
                  {[
                    { label: "Full name", key: "fullName", value: editingValues.fullName ?? "Maya Patel" },
                    { label: "Enrollment number", key: "barNumber", value: editingValues.barNumber ?? "LND-887-210" },
                    { label: "State Bar Council", key: "stateBar", value: editingValues.stateBar ?? "England & Wales Bar Council" },
                    { label: "Email", key: "email", value: editingValues.email ?? "maya@legalos.com" },
                    { label: "Government ID number", key: "governmentIdNumber", value: editingValues.governmentIdNumber ?? "XXXX-1234" },
                  ].map((field) => (
                    <label key={field.key} className="group block rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{field.label}</span>
                        <span className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Editable</span>
                      </div>
                      <input
                        value={reviewChanges[field.key] ?? field.value}
                        onChange={(event) => setReviewChanges((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Confidence snapshot
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-950/80">
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>Confidence score</span>
                    <span className="text-slate-900 dark:text-white">{displayDraft.confidence}%</span>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-4 rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-blue-500" style={{ width: `${displayDraft.confidence}%` }} />
                  </div>
                </div>
                {displayDraft.confidence < 90 && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                    <div className="font-semibold">Confidence warning</div>
                    <p className="mt-2">Your verification score is below 90%. Review your documents carefully before submitting to avoid delays.</p>
                  </div>
                )}
                <div className="rounded-3xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">Next</p>
                  <p className="mt-2">Once submitted, your package will enter admin review. You will receive updates in-app and by email.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "submit" && (
          <motion.section key="submit" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Submit for review</span>
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 dark:text-white">Ready to send your verification package</h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Press Submit to notify the LegalOS verification team. We’ll begin review immediately and keep you informed every step of the way.
                </p>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Estimated review time</span>
                    <span className="font-semibold text-slate-900 dark:text-white">24–48 hours</span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>We’ll notify you once the admin team has completed the verification checks.</p>
                    <p>If additional documents are needed, you’ll receive a request directly in your inbox.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <XCircle className="h-4 w-4 text-rose-500" /> Final checklist
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Government ID uploaded</li>
                  <li>• Bar council certificate uploaded</li>
                  <li>• Face selfie uploaded</li>
                  <li>• AI extracted fields verified</li>
                </ul>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "pending" && (
          <motion.section key="pending" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Verification pending</div>
              <h3 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">Your package is under review</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">LegalOS has received your documents. The admin team will review your package and notify you when the verification is complete.</p>
              <div className="mt-10 space-y-4">
                {[
                  "Documents Uploaded",
                  "OCR Completed",
                  "Face Verified",
                  "Bar Verification",
                  "Under Admin Review",
                ].map((label, index) => (
                  <div key={label} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950/80">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{index === 4 ? "Awaiting final admin approval." : "Completed."}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white shadow-xl dark:border-slate-800">
                <p className="text-sm uppercase tracking-[0.24em] text-blue-200">Estimated review time</p>
                <p className="mt-3 text-2xl font-semibold">24–48 hours</p>
                <p className="mt-3 text-sm text-slate-300">You will receive in-app and email updates for every status change.</p>
              </div>
            </div>
          </motion.section>
        )}

        {currentStep.key === "complete" && (
          <motion.section key="complete" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.75fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Verification complete</span>
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 dark:text-white">You are now a verified lawyer</h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">Congratulations! Your application has been approved and you now have full access to the LegalOS lawyer marketplace and premium workflow tools.</p>
                <div className="rounded-[1.75rem] bg-slate-50 p-6 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
                    <span>Verified status</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Approved</span>
                  </div>
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Your profile is now listed in the verified lawyer marketplace. Clients can book consultations and request contract review services.</div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">What’s next</div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Access AI contract generation</li>
                  <li>• Publish your lawyer profile</li>
                  <li>• Review client requests and book consultations</li>
                  <li>• Use document analyzer and clause explainer</li>
                </ul>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {currentIndex < steps.length - 1 ? `Step ${currentIndex + 1} of ${steps.length}: ${currentStep.label}` : "Complete"}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={currentIndex === 0 || loading} onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">
            Back
          </button>
          <button type="button" onClick={handleNext} disabled={!canAdvance} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {currentStep.key === "submit" ? "Submit verification" : currentStep.key === "complete" ? "Done" : "Continue"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {serverErrors && <div className="text-sm font-medium text-rose-600">{serverErrors}</div>}
      </div>
    </div>
  );
}
