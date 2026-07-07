import { AWSRekognitionProvider } from "./aws-rekognition";
import { MicrosoftFaceProvider } from "./microsoft-face";

export type FaceVerificationResult = {
  success: boolean;
  confidence: number; // 0-100
  details?: string;
  provider: string;
};

export interface FaceProvider {
  verifyFace(userId: string, imageBuffer: Buffer): Promise<FaceVerificationResult>;
  livenessCheck?(userId: string, data: any): Promise<FaceVerificationResult>;
}

export const MockFaceProvider: FaceProvider = {
  async verifyFace() {
    return { success: true, confidence: 86, details: "Mock face match", provider: "mock" };
  },
  async livenessCheck() {
    return { success: true, confidence: 95, details: "Mock liveness passed", provider: "mock" };
  },
};

export function getFaceProvider(): FaceProvider {
  const provider = process.env.FACE_PROVIDER?.toLowerCase();

  if (provider === "aws-rekognition") {
    return new AWSRekognitionProvider();
  }

  if (provider === "microsoft-face") {
    return new MicrosoftFaceProvider();
  }

  return MockFaceProvider;
}
