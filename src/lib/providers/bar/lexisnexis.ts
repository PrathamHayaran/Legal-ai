import { BarProvider, BarVerificationResult } from "./index";

export class LexisNexisBarProvider implements BarProvider {
  async verifyEnrollment(barNumber: string, state?: string, name?: string): Promise<BarVerificationResult> {
    // TODO: implement connection to a legal registration or bar verification API.
    return {
      success: false,
      matched: false,
      provider: "lexisnexis",
      details: "LexisNexis bar verification not configured",
    };
  }
}
