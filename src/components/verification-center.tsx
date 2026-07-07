"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { VerificationWizard } from "@/components/verification-wizard";

export function VerificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/40"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-sky-400/90">Verification center</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Complete your lawyer verification without leaving the dashboard</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close verification modal"
                className="rounded-full border border-slate-700 bg-slate-950/90 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-6">
              <VerificationWizard />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
