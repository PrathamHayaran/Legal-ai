import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const templates: Record<string, string> = {
  "NDA": "Non-disclosure agreement with mutual confidentiality obligations.",
  "Employment Agreement": "Employment agreement with compensation, benefits, termination, and IP assignment.",
  "Freelancer Agreement": "Independent contractor agreement for freelance services with payment and deliverables.",
  "Vendor Agreement": "Vendor agreement covering supply, warranties, payment, and delivery terms.",
  "Partnership Agreement": "Partnership agreement with governance, profit sharing, and exit provisions.",
  "Consulting Agreement": "Consulting services agreement with scope, fees, and deliverables.",
  "Service Agreement": "Service agreement with obligations, service levels, and liability limits.",
  "Privacy Policy": "Privacy policy for collection, processing, and security of personal data.",
  "Terms of Service": "Terms of service for platform use, disclaimers, and limitations of liability.",
  "IP Assignment": "Intellectual property assignment agreement with ownership transfer and moral rights waiver.",
  "Licensing Agreement": "Software licensing agreement with permitted use, restrictions, and indemnity.",
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { template, prompt, metadata } = body as { template: string; prompt: string; metadata: Record<string, string> };

  const title = metadata.title || `${template} draft`;
  const text = `# ${title}\n\n## Introduction\nThis ${template.toLowerCase()} is generated for ${metadata.partyA || "Party A"} and ${metadata.partyB || "Party B"}.\n\n${templates[template] || templates.NDA}\n\n## Definitions\n\n## Scope of services\n\n## Payment terms\n\n## Confidentiality\n\n## Intellectual property\n\n## Termination\n\n## Dispute resolution\n\n## Governing law\n\n## Signatures\n\n---\n\n### AI Notes\nGenerated from prompt: ${prompt}`;

  const contract = await prisma.contract.create({
    data: {
      title,
      ownerId: userId,
    },
  });

  await prisma.document.create({
    data: {
      title,
      fileName: `${title}.txt`,
      storageKey: `contracts/${userId}/${contract.id}.txt`,
      mimeType: "text/plain",
      content: Buffer.from(text).toString("base64"),
      ownerId: userId,
      contractId: contract.id,
    },
  });

  return NextResponse.json({ ok: true, draft: text, versionId: contract.id });
}
