import { prisma } from "@/lib/prisma";
import { extractText, processDocument } from "@/lib/doc-pipeline";
import { FaceProvider, getFaceProvider, MockFaceProvider } from "@/lib/providers/face";
import { BarProvider, getBarProvider, MockBarProvider } from "@/lib/providers/bar";

type Extracted = {
  fullName?: string | null;
  barNumber?: string | null;
  stateBar?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  email?: string | null;
};

function parseFromText(text: string): Extracted {
  const out: Extracted = {};
  // name heuristics: look for lines starting with Name: or common patterns
  const nameMatch = text.match(/(?:Name|Full Name|Applicant)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
  if (nameMatch) out.fullName = nameMatch[1].trim();

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) out.email = emailMatch[0];

  const barMatch = text.match(/(?:Bar\s*(?:Reg|No|Number)|Enrollment)[:\s]*([A-Z0-9-\/]+)/i);
  if (barMatch) out.barNumber = barMatch[1].trim();

  const stateMatch = text.match(/(State|Jurisdiction|Bar Council)[:\s]*([A-Za-z\s]+)/i);
  if (stateMatch) out.stateBar = stateMatch[2].trim();

  const issueMatch = text.match(/(Issued|Issue Date|Date of Issue)[:\s]*([0-9]{2,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})/i);
  if (issueMatch) out.issueDate = issueMatch[2];

  const expiryMatch = text.match(/(Expiry Date|Expires|Valid Until)[:\s]*([0-9]{2,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})/i);
  if (expiryMatch) out.expiryDate = expiryMatch[2];

  return out;
}

function scoreMatch(parsed: Extracted, profile: any, registration: any) {
  // weights
  const weights = { name: 30, email: 20, barNumber: 30, state: 10, date: 10 };
  let score = 0;
  const mismatches: string[] = [];

  // name
  if (parsed.fullName) {
    const targetName = (registration?.name || profile?.name || "").toLowerCase();
    if (targetName && parsed.fullName.toLowerCase().includes(targetName)) {
      score += weights.name;
    } else {
      mismatches.push("Name mismatch");
    }
  } else {
    mismatches.push("Name not found");
  }

  // email
  if (parsed.email) {
    const targetEmail = (registration?.email || profile?.email || "").toLowerCase();
    if (targetEmail && parsed.email.toLowerCase() === targetEmail) {
      score += weights.email;
    } else {
      mismatches.push("Email mismatch");
    }
  } else {
    mismatches.push("Email not found");
  }

  // bar number
  if (parsed.barNumber) {
    const targetBar = (registration?.barNumber || profile?.barNumber || "").toLowerCase();
    if (targetBar && parsed.barNumber.toLowerCase() === targetBar) {
      score += weights.barNumber;
    } else {
      mismatches.push("Enrollment number mismatch");
    }
  } else {
    mismatches.push("Enrollment number not found");
  }

  // state
  if (parsed.stateBar) {
    const targetState = (registration?.state || profile?.state || "").toLowerCase();
    if (targetState && parsed.stateBar.toLowerCase().includes(targetState)) {
      score += weights.state;
    } else {
      mismatches.push("State/Bar Council mismatch");
    }
  }

  // expiry
  if (parsed.expiryDate) {
    const now = new Date();
    const parsedDate = new Date(parsed.expiryDate);
    if (!isNaN(parsedDate.getTime())) {
      if (parsedDate >= now) {
        score += weights.date;
      } else {
        mismatches.push("Expired certificate");
      }
    }
  }

  return { score: Math.min(100, Math.max(0, score)), mismatches };
}

export async function runVerificationForUser(userId: string, performedByUserId?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { lawyerProfile: true } });
  if (!user) throw new Error("User not found");

  const docs = await prisma.document.findMany({ where: { ownerId: userId } });

  const extractedAll: any[] = [];
  for (const doc of docs) {
    let buf: Buffer | null = null;
    if (doc.content) buf = Buffer.from(doc.content, "base64");
    if (!buf) continue;
    const text = await extractText(buf, doc.fileName, doc.mimeType);
    const parsed = parseFromText(text || "");
    extractedAll.push({ docId: doc.id, parsed, textSnippet: (text || "").slice(0, 1000) });
  }

  // Aggregate parsed fields (prefer presence)
  const agg: any = {};
  for (const e of extractedAll) {
    const p = e.parsed;
    if (p.fullName && !agg.fullName) agg.fullName = p.fullName;
    if (p.barNumber && !agg.barNumber) agg.barNumber = p.barNumber;
    if (p.stateBar && !agg.stateBar) agg.stateBar = p.stateBar;
    if (p.issueDate && !agg.issueDate) agg.issueDate = p.issueDate;
    if (p.expiryDate && !agg.expiryDate) agg.expiryDate = p.expiryDate;
    if (p.email && !agg.email) agg.email = p.email;
  }

  const { score, mismatches } = scoreMatch(agg, user.lawyerProfile, { name: user.name, email: user.email, barNumber: user.lawyerProfile?.barNumber, state: user.lawyerProfile?.state });

  const faceProvider: FaceProvider = getFaceProvider();
  const barProvider: BarProvider = getBarProvider();

  let faceResult = null;
  try {
    const faceDoc = docs.find((d) => /face|selfie|photo|id/i.test(d.fileName));
    if (faceDoc && faceDoc.content) {
      const buf = Buffer.from(faceDoc.content, "base64");
      faceResult = await faceProvider.verifyFace(userId, buf);
    }
  } catch (e) {
    console.error("face provider error", e);
  }

  let barResult = null;
  try {
    if (agg.barNumber) {
      barResult = await barProvider.verifyEnrollment(agg.barNumber, agg.stateBar, agg.fullName);
      if (barResult && barResult.matched) {
        // We may incorporate provider confidence in future scoring.
      }
    }
  } catch (e) {
    console.error("bar provider error", e);
  }

  // Decide status
  let status: any = "PENDING";
  if (score >= 90) status = "FULLY_VERIFIED";
  else if (score >= 75) status = "BAR_VERIFIED";
  else if (score >= 50) status = "IDENTITY_VERIFIED";
  else if (score >= 25) status = "PARTIALLY_VERIFIED";
  else status = "PENDING";

  const p: any = prisma as any;
  const verification = await p.verificationResult.create({
    data: {
      userId,
      lawyerProfileId: user.lawyerProfile?.id,
      status,
      confidence: score,
      extractedData: { extractedAll, agg },
      mismatches: mismatches.join("; ") || null,
      providerResponses: { face: faceResult, bar: barResult },
    },
  });

  await p.verificationHistory.create({
    data: {
      verificationId: verification.id,
      action: "RUN_VERIFICATION",
      details: `Auto-run verification produced status=${status} score=${score}`,
      performedByUserId: performedByUserId ?? userId,
    },
  });

  // Update lawyerProfile verificationStatus and verifiedAt when fully verified
  try {
    if (status === "FULLY_VERIFIED") {
      await prisma.lawyerProfile.update({ where: { userId }, data: { verificationStatus: "APPROVED", verifiedAt: new Date() } });
    } else if (status === "REJECTED") {
      await prisma.lawyerProfile.update({ where: { userId }, data: { verificationStatus: "REJECTED" } });
    }
  } catch (e) {
    console.error("failed to update lawyerProfile status:", e);
  }

  return verification;
}
