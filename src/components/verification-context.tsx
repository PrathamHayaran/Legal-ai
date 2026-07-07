"use client";

import { createContext, useContext, useMemo, useState } from "react";

type VerificationContextValue = {
  open: boolean;
  openVerificationCenter: () => void;
  closeVerificationCenter: () => void;
};

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      openVerificationCenter: () => setOpen(true),
      closeVerificationCenter: () => setOpen(false),
    }),
    [open]
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerificationCenter() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVerificationCenter must be used within a VerificationProvider");
  }
  return context;
}
