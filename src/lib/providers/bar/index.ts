import { LexisNexisBarProvider } from "./lexisnexis";

export type BarVerificationResult = {
  success: boolean;
  matched: boolean;
  provider: string;
  details?: string;
};

export interface BarProvider {
  verifyEnrollment(barNumber: string, state?: string, name?: string): Promise<BarVerificationResult>;
}

export const MockBarProvider: BarProvider = {
  async verifyEnrollment(barNumber: string) {
    const lastChar = (barNumber || "").slice(-1);
    const matched = /[13579]/.test(lastChar);
    return { success: true, matched, provider: "mock", details: matched ? "Mock matched" : "Mock not found" };
  },
};

export function getBarProvider(): BarProvider {
  const provider = process.env.BAR_PROVIDER?.toLowerCase();

  if (provider === "lexisnexis") {
    return new LexisNexisBarProvider();
  }

  return MockBarProvider;
}
