import { FaceProvider, FaceVerificationResult } from "./index";

export class MicrosoftFaceProvider implements FaceProvider {
  async verifyFace(userId: string, imageBuffer: Buffer): Promise<FaceVerificationResult> {
    // TODO: wire Microsoft Face API with your Azure credentials and endpoint.
    return { success: false, confidence: 0, details: "Microsoft Face API not configured", provider: "microsoft-face" };
  }

  async livenessCheck(userId: string, data: any): Promise<FaceVerificationResult> {
    return { success: false, confidence: 0, details: "Microsoft Face API liveness not configured", provider: "microsoft-face" };
  }
}
