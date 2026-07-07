import { FaceProvider, FaceVerificationResult } from "./index";

export class AWSRekognitionProvider implements FaceProvider {
  async verifyFace(userId: string, imageBuffer: Buffer): Promise<FaceVerificationResult> {
    // TODO: wire AWS Rekognition with the configured AWS credentials.
    return { success: false, confidence: 0, details: "AWS Rekognition not configured", provider: "aws-rekognition" };
  }

  async livenessCheck(userId: string, data: any): Promise<FaceVerificationResult> {
    return { success: false, confidence: 0, details: "AWS Rekognition liveness not configured", provider: "aws-rekognition" };
  }
}
