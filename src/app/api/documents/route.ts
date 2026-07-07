import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let title: string;
    let fileName: string;
    let storageKey: string;
    let mimeType: string;
    let content: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("document") as File | null;
      title = (formData.get("title") as string) ?? file?.name ?? "Uploaded document";
      fileName = file?.name ?? "upload";
      storageKey = (formData.get("storageKey") as string) ?? fileName;
      mimeType = file?.type ?? "application/octet-stream";

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        content = buffer.toString("base64");
      }
    } else {
      const body = await request.json();
      title = body.title;
      fileName = body.fileName;
      storageKey = body.storageKey;
      mimeType = body.mimeType;
      content = body.content;
    }

    const document = await prisma.document.create({
      data: {
        title,
        fileName,
        storageKey,
        mimeType,
        content,
        ownerId: userId,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("/api/documents error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
