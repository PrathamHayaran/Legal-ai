-- CreateEnum
CREATE TYPE "VerificationStage" AS ENUM ('PENDING', 'PARTIALLY_VERIFIED', 'IDENTITY_VERIFIED', 'BAR_VERIFIED', 'FULLY_VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "verificationId" TEXT;

-- CreateTable
CREATE TABLE "VerificationResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lawyerProfileId" TEXT,
    "status" "VerificationStage" NOT NULL DEFAULT 'PENDING',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "extractedData" JSONB,
    "mismatches" TEXT,
    "providerResponses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationHistory" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VerificationResult" ADD CONSTRAINT "VerificationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationResult" ADD CONSTRAINT "VerificationResult_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationHistory" ADD CONSTRAINT "VerificationHistory_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "VerificationResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationHistory" ADD CONSTRAINT "VerificationHistory_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "VerificationResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
