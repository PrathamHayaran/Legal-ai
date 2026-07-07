import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { processDocument } from "@/lib/doc-pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as any;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name || "upload";
    const mimeType = file.type || undefined;

    // Save document record
    const doc = await prisma.document.create({
      data: {
        title: filename,
        fileName: filename,
        storageKey: `uploads/${userId}/${Date.now()}-${filename}`,
        mimeType: mimeType ?? "application/octet-stream",
        content: buffer.toString("base64"),
        ownerId: userId,
      },
    });

    // Process document
    const result = await processDocument(buffer, filename, mimeType);

    // Persist extracted summary on lawyer profile if user is a lawyer
    try {
      const profile = await prisma.lawyerProfile.upsert({
        where: { userId },
        create: {
          userId,
          verificationStatus: "PENDING",
          professionalDetails: result.text.slice(0, 1000),
        },
        update: {
          professionalDetails: result.text.slice(0, 1000),
        },
      });
    } catch (e) {
      console.error("Failed to upsert lawyer profile", e);
    }

    return NextResponse.json({ ok: true, docId: doc.id, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
