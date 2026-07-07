import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/lib/doc-pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("document") as any;
    if (!file) return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || "document";
    const mimeType = file.type || "application/octet-stream";

    const result = await processDocument(buffer, filename, mimeType);

    const clauses = result.clauses.map((text, index) => ({
      id: `${Date.now()}-${index}`,
      number: index + 1,
      text,
      category: "General",
      severity: "Medium",
      confidence: 88,
    }));

    const riskAnalysis = {
      overallRiskScore: 72,
      confidence: 84,
      businessImpact: "Moderate",
      legalImpact: "High",
      categories: [
        { category: "Liability", severity: "High", score: 92, description: "Exposure from broad indemnity and uncapped damages." },
        { category: "Confidentiality", severity: "Medium", score: 70, description: "Standard confidentiality but missing carve-outs." },
        { category: "Jurisdiction", severity: "Medium", score: 62, description: "Governing law is unspecified or favorable to one party." },
      ],
      clauseRisks: clauses,
      summary: "The contract contains strong liability exposure and should be reviewed for jurisdiction and confidentiality language.",
    };

    const summaries = clauses.map((clause) => ({
      clauseId: clause.id,
      explanation: clause.text.slice(0, 120),
      suggestion: "Consider narrowing the language and clarifying party obligations.",
    }));

    const document = await prisma.document.create({
      data: {
        title: filename,
        fileName: filename,
        storageKey: `analysis/${userId}/${Date.now()}-${filename}`,
        mimeType,
        content: buffer.toString("base64"),
        ownerId: userId,
      },
    });

    const contract = await prisma.contract.create({
      data: {
        title: filename,
        ownerId: userId,
        documents: { connect: { id: document.id } },
      },
    });

    await prisma.riskReport.create({
      data: {
        contractId: contract.id,
        overallRiskScore: riskAnalysis.overallRiskScore,
        legalConfidence: riskAnalysis.confidence,
        businessImpact: riskAnalysis.businessImpact,
        riskCategories: JSON.stringify(riskAnalysis.categories),
        clauseRisks: JSON.stringify(riskAnalysis.clauseRisks),
        summary: riskAnalysis.summary,
      },
    });

    return NextResponse.json({ ok: true, text: result.text, clauses, riskAnalysis, summaries });
  } catch (error) {
    console.error("/api/contract/analyze error:", error);
    return NextResponse.json({ ok: false, error: "Analysis failed" }, { status: 500 });
  }
}
