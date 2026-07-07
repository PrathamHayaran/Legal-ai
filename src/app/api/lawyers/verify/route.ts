import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { status, governmentIdUrl, barCertificateUrl, professionalDetails, faceVerificationUrl } = body;

    const lawyer = await prisma.lawyerProfile.upsert({
      where: { userId },
      create: {
        userId,
        verificationStatus: status,
        governmentIdUrl,
        barCertificateUrl,
        professionalDetails,
        faceVerificationUrl,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
      update: {
        verificationStatus: status,
        governmentIdUrl,
        barCertificateUrl,
        professionalDetails,
        faceVerificationUrl,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    return NextResponse.json({ lawyer }, { status: 200 });
  } catch (error) {
    console.error("/api/lawyers/verify error:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}
