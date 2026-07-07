import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MockFaceProvider } from "@/lib/providers/face";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file") as any;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());

    const result = await MockFaceProvider.verifyFace(userId, buf);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
